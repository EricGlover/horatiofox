import {Command, optionRegexifier, regexifier} from "./Command.js";

export class ShieldsCommand extends Command {
    constructor(game, terminal, player) {
        super('sh', 'shields', 'shields');
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.addMode("up", "up");
        this.addMode("down", "down", "do", "d");
        this.addMode("charge", "charge", "ch", "c");
        this.addMode("drain", "drain", "dr");
        this._info = `  
Full commands:  SHIELDS UP
                SHIELDS DOWN
                SHIELDS CHARGE [amount of energy to put into the shields]
                SHIELDS DRAIN  [amount of energy to take from the shields]

Your deflector shields are a defensive device to protect you from
Klingon attacks (and nearby novas).  As the shields protect you, they
gradually weaken.  A shield strength of 75%, for example, means that
the next time a Klingon hits you, your shields will deflect 75% of
the hit, and let 25% get through to hurt you.

It costs 50 units of energy to raise shields, nothing to lower them.
You may move with your shields up; this costs nothing under impulse
power, but doubles the energy required for warp drive.

Each time you raise or lower your shields, the Klingons have another
chance to attack.

You may not fire phasers through your shields.  However you may use
the "high-speed shield control" to lower shields, fire phasers, and
raise the shields again before the Klingons can react.  Since rapid
lowering and raising of the shields requires more energy than normal
speed operation, it costs you 200 units of energy to activate this
control.  It is automatically activated when you fire phasers while
shields are up.  You may fire photon torpedoes, but they may be
deflected considerably from their intended course as they pass
through the shields (depending on shield strength).

You may transfer energy between the ship's energy (given as "Energy"
in the status) and the shields. To transfer energy from your ship to your shields 
use the charge mode. The drain mode does the opposite.

Enemy torpedoes hitting your ship explode on your shields (if they
are up) and have essentially the same effect as phaser hits.`;
    }

    run() {
        // get mode : up/down or charge/drain
        let {up, down, charge, drain} = this.getMode(this.terminal.getArguments());

        if (!up && !down && !charge && !drain) {
            this.terminal.printLine("Beg pardon, Captain?");
            this.terminal.printLine("Valid options are : 'up', 'down', 'charge', or 'drain'.");
            return;
        }

        if (up) {
            this.player.shieldsUp();
        } else if (down) {
            this.player.shieldsDown();
        } else if (charge || drain) {
            let playerShields = this.player.shields;
            let playerPowerGrid = this.player.powerGrid;
            // get the amount to transfer
            let amount = this.terminal.getArguments()[1];
            amount = Number.parseInt(amount);
            if (Number.isNaN(amount)) {
                // parse error
                this.terminal.printLine(`${amount} is an gibberish amount to transfer captain.`);
                return;
            } else if (amount === 0) {
                this.terminal.printLine("Beg pardon Captain?");
                return;
            }
            // check that you can do the transfer
            if (playerShields.isDamaged()) {
                this.terminal.echo("Shields damaged.");
                return;
            }
            if (charge) {
                // need the energy
                if (playerPowerGrid.energy < amount) {
                    this.terminal.printLine("Not enough energy, Captain.");
                    return;
                }
                // ignore if shields at max
                if (playerShields.units === playerShields.capacity) {
                    this.terminal.printLine("Shields already at max, Captain.");
                    return;
                }

                // don't overflow
                let sh = playerShields.units + amount;
                if (sh > playerShields.capacity) {
                    amount = playerShields.capacity - playerShields.units;
                }

                // do the transfer
                this.terminal.printLine("Charging shields.");
                playerPowerGrid.useEnergy(amount);
                playerShields.charge(amount);
            } else if (drain) {
                // check shield energy
                if (amount > playerShields.units) {
                    this.terminal.printLine("Not enough energy in shields. Draining what we have.");
                    amount = playerShields.units;
                }
                // check ship energy not already maxed out
                if (playerPowerGrid.atMax()) {
                    this.terminal.printLine("Ship energy already at max.");
                    return;
                }
                // check that we don't exceed ship energy capacity
                if (playerPowerGrid.energy + amount > playerPowerGrid.capacity) {
                    this.terminal.printLine("That would exceed our ship energy capacity. Setting ship energy to maximum.");
                    amount = playerPowerGrid.capacity - playerPowerGrid.energy;
                }

                playerShields.drain(amount);
                playerPowerGrid.addEnergy(amount);
            }
        }
    }
}