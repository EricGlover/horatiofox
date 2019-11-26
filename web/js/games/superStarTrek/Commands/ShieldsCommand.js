import {Command, optionRegexifier, regexifier} from "./Command.js";

export class ShieldsCommand extends Command {
    constructor(game, terminal, player) {
        super('sh', 'shields', 'shields');
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.addRequiredDevice(this.player.shields);
        this.upMode = this.addMode("up", "up", false, 'up', 'u');
        this.upMode.addRequiredDevice(this.player.shields);
        this.downMode = this.addMode("down", "down", false, "down", "do", "d");
        this.downMode.addRequiredDevice(this.player.shields);
        this.chargeMode = this.addMode("charge", "charge", false, "charge", "ch", "c");
        this.chargeMode.addRequiredDevice(this.player.shields, this.player.powerGrid);
        this.drainMode = this.addMode("drain", "drain",  false, "drain", "dr");
        this.drainMode.addRequiredDevice(this.player.shields, this.player.powerGrid);
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

    async runInteractive() {
        let shields = this.player.shields;
        let powerGrid = this.player.powerGrid;
        // check for damage
        if(!this.areRequiredDevicesFunctional()) {
            this.terminal.printLine(this.getDamagedDeviceError());
            return;
        }
        // print shields status
        this.terminal.printLine(`Shields are currently ${this.player.shields.up ? 'UP' : 'DOWN'}`);
        let up = false;
        let down = false;
        let charge = false;
        let drain = false;
        let amount;


        if(shields.up) {
            up = false;
            down = await this.getConfirmation(this.terminal, `Would you like to lower shields?`);
        } else {
            up = await this.getConfirmation(this.terminal, `Would you like to raise shields?`);
            down = false;
        }
        // if charge or drain get the amount
        if(!up && !down) {
            charge = await this.getConfirmation(this.terminal, `Would you like to charge the shields from ship energy?`);
            if(charge) {
                // check damage
                let chargeMode = this.getMode("charge");
                if(!chargeMode.areRequiredDevicesFunctional()) {
                    this.terminal.printLine(chargeMode.getDamagedDeviceError());
                    return;
                }
                // calculate the max you can transfer (capacity left or ship energy, whichever's smaller)
                let rem = shields.remainingCapacity();
                let gridEnergy = powerGrid.energy;
                let maxAmount = Math.min(rem, gridEnergy);
                this.terminal.echo(`Shields can be charged ${rem.toFixed(2)} units. `);
                this.terminal.echo(`Ship energy is currently ${gridEnergy.toFixed(2)} units.\n`);
                this.terminal.printLine(`The maximum amount of energy you can transfer to shields is ${maxAmount.toFixed(2)} units.`);
                let response;
                let valid = false;
                do {
                    response = await this.terminal.ask(`How much energy would you like to charge shields with? `);
                    response = Number.parseFloat(response);
                    if(Number.isNaN(response)) {
                        let cancel = await this.getConfirmation(this.terminal, `Cancel command? `);
                        if(cancel) return {cancel};
                    } else if (response <= 0) {
                        let cancel = await this.getConfirmation(this.terminal, `Cancel command? `);
                        if(cancel) return {cancel};
                    } else if (response > maxAmount) {
                        this.terminal.printLine(`We can only transfer ${maxAmount.toFixed(2)} units.`);
                        let yes = await this.getConfirmation(this.terminal, `Transfer ${maxAmount.toFixed(2)} units? `);
                        if(yes) {
                            valid = true;
                            amount = response;
                        }
                    } else {
                        valid = true;
                        amount = response;
                    }
                } while (!valid);
            } else {
                drain = await this.getConfirmation(this.terminal, `Would you like to drain power from the shields (transfer power to the ship)?`);
                if(drain) {
                    // check damage
                    let drainMode = this.getMode("drain");
                    if(!drainMode.areRequiredDevicesFunctional()) {
                        this.terminal.printLine(drainMode.getDamagedDeviceError());
                        return;
                    }
                    // calculate the max you can transfer (remaining capacity, or shield energy, whichever's smaller)
                    let remainingCap = powerGrid.capacity - powerGrid.energy;
                    let shieldEnergy = shields.units;
                    let maxAmount = Math.min(remainingCap, shieldEnergy);
                    this.terminal.printLine(`Ship can be charged ${remainingCap.toFixed(2)} units. Shield energy is currently ${shieldEnergy.toFixed(2)} units.`);
                    this.terminal.printLine(`The maximum amount of energy you can transfer to the ship is ${maxAmount.toFixed(2)}.`);
                    let response;
                    let valid = false;
                    do {
                        response = await this.terminal.ask(`How much energy would you like to charge the ship with? `);
                        response = Number.parseFloat(response);
                        if(Number.isNaN(response)) {
                            let cancel = await this.getConfirmation(this.terminal, `Cancel command? `);
                            if(cancel) return {cancel};
                        } else if (response <= 0) {
                            let cancel = await this.getConfirmation(this.terminal, `Cancel command? `);
                            if(cancel) return {cancel};
                        } else if (response > maxAmount) {
                            this.terminal.printLine(`We can only transfer ${maxAmount.toFixed(2)} units.`);
                            let yes = await this.getConfirmation(this.terminal, `Transfer ${maxAmount.toFixed(2)} units? `);
                            if(yes) {
                                valid = true;
                                amount = response;
                            }
                        } else {
                            valid = true;
                            amount = response;
                        }
                    } while(!valid);
                }
            }
        }

        if(!up && !down && !charge && !drain) { // loop de loop
            let cancel = await this.getConfirmation(this.terminal, `Cancel command? `);
            if(cancel) return {cancel};
            return await this.runInteractive();
        }

        return {up, down, charge, drain, amount};
    }

    shieldsUp() {
        this.player.shieldsUp();
    }

    shieldsDown() {
        this.player.shieldsDown();
    }

    charge(amount) {
        let chargeMode = this.getMode("charge");
        if(!chargeMode.areRequiredDevicesFunctional()) {
            this.terminal.printLine(chargeMode.getDamagedDeviceError());
            return;
        }
        let playerPowerGrid = this.player.powerGrid;
        let playerShields = this.player.shields;
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
            this.terminal.printLine("That would exceed our shield energy capacity. Setting shields to max.");
            amount = playerShields.capacity - playerShields.units;
        }

        // do the transfer
        this.terminal.printLine("Charging shields.");
        playerPowerGrid.useEnergy(amount);
        playerShields.charge(amount);
    }

    drain(amount) {
        let drainMode = this.getMode("drain");
        if(!drainMode.areRequiredDevicesFunctional()) {
            this.terminal.printLine(drainMode.getDamagedDeviceError());
            return;
        }
        let playerPowerGrid = this.player.powerGrid;
        let playerShields = this.player.shields;

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

    async run() {
        // get mode : up/down or charge/drain
        let {up, down, charge, drain} = this.parseMode(this.terminal.getArguments());
        let amount;
        let runInteractive = !up && !down && !charge && !drain;

        // get the amount
        if (charge || drain) {
            // get the amount to transfer
            amount = this.terminal.getArguments()[1];
            amount = Number.parseInt(amount);
            if (Number.isNaN(amount)) {
                // parse error
                this.terminal.printLine(`${amount} is an gibberish amount to transfer captain.`);
                runInteractive = true;
            } else if (amount === 0) {
                this.terminal.printLine("Beg pardon Captain?");
                runInteractive = true;
            }
        }

        // run interactive mode if they can't figure text commands
        if (runInteractive) {
            let response = await this.runInteractive();
            if(response.cancel) return;
            up = response.up;
            down = response.down;
            charge = response.charge;
            drain = response.drain;
            amount = response.amount;
        }


        // run mode
        if (up) {
            this.shieldsUp();
        } else if (down) {
            this.shieldsDown();
        } else if (charge) {
            this.charge(amount);
        } else if (drain) {
            this.drain(amount);
        }
    }
}