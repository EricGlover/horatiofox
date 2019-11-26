// then add the no option (if no appears anywh  ere then don't raise shields using high speed control)
import {Command, regexifier, ATTACK_COMMAND} from "./Command.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Utility} from "../utils/Utility";

export class PhasersCommand extends Command {
    constructor(game, terminal, player) {
        super('p', 'phasers', 'fire phasers', ATTACK_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.options.addOption("no", "n", "no");
        this.addMode("automatic", 'auto', true, "a", "auto", "automatic");
        this.addMode("manual", 'manual', false, "m", "man", "manual");
        this._info = `
Full commands:  PHASERS AUTOMATIC [AMOUNT TO FIRE] (NO)
                PHASERS MANUAL (NO) [AMOUNT 1] [AMOUNT 2]...[AMOUNT N]

Phasers are energy weapons. As you fire phasers at Klingons, you
specify an "amount to fire" which is drawn from your energy reserves.
The amount of total hit required to kill an enemy is partly random,
but also depends on skill level.

Phaser fire diminishes to about 60 percent at 5 sectors.

The average hit required to kill an ordinary Klingon varies from 200
units in the Novice game to 250 units in the Emeritus game.
Commanders normally require from 600 (Novice) to 700 (Emeritus).  The
Super-commander requires from 875 (Good) to 1000 (Emeritus). Romulans
require an average of 350 (Novice) to 450 (Emeritus).

Hits on enemies are cumulative, as long as you don't leave the
quadrant.

In general, not all that you fire will reach the Klingons.  The
farther away they are, the less phaser energy will reach them. If a
Klingon is adjacent to you, he will receive about 90% of the phaser
energy directed at him; a Klingon 5 sectors away will receive about
60% and a Klingon 10 sectors away will receive about 35%. There is
some randomness involved, so these figures are not exact. Phasers
have no effect beyond the boundaries of the quadrant you are in.

Phasers may overheat (and be damaged) if you fire too large a burst
at once. Firing up to 1500 units is safe.  From 1500 on up the
probability of overheat increases with the amount fired.

If phaser firing is automatic, the computer decides how to divide up
your [amount to fire] among the Klingons present.  If phaser firing
is manual, you specify how much energy to fire at each Klingon
present (nearest first), rather than just specifying a total amount.
You can abbreviate "MANUAL" and "AUTOMATIC" to one or more letters; if
you mention neither, automatic fire is usually assumed.

Battle computer information is available by firing phasers manually,
and allowing the computer to prompt you.  If you enter zero for the
amount to fire at each enemy, you will get a complete report, without
cost.  The battle computer will tell you how much phaser energy to
fire at each enemy for a sure kill.  This information appears in
parentheses prior to the prompt for each enemy.  SInce the amount is
computed from sensor data, if either the computer or the S.R. sensors
are damaged, this information will be unavailable, and phasers must
be fired manually.

A safety interlock prevents phasers from being fired through the
shields.  If this were not so, the shields would contain your fire
and you would fry yourself.  However, you may utilize the
"high-speed shield control" to drop shields, fire phasers, and raise
shields before the enemy can react.  Since it takes more energy to
work the shields rapidly with a shot, it costs you 200 units of
energy each time you activate this control.  It is automatically
activated when you fire phasers while the shields are up. By
specifying the (no) option, shields are not raised after firing.

Phasers have no effect on starbases (which are shielded) or on stars.`;
    }

    async runInteractive() {
        let shieldControl = 200;
        let useShieldControl = this.player.shields.up;
        let leaveShieldsDown;
        if (this.player.shields.up) {
            leaveShieldsDown = await this.getConfirmation(this.terminal, `Would you like to leave shields down after firing?`);
            if (leaveShieldsDown) {
                shieldControl -= 50;
                this.terminal.printLine(`Fast Shield Control will only cost ${shieldControl} units.`);
            } else {
                this.terminal.printLine(`Fast Shield Control will cost ${shieldControl} units.`);
            }
        } else {
            shieldControl = 0;
            leaveShieldsDown = true;
        }

        // would you like to target
        let manual = await this.getConfirmation(this.terminal, `Would you like to specify your targets?`);
        if (manual) {
            // enemy name at x - y : amount to fire to kill
            let enemyArr = this.getEnemiesByDistance();
            let targets = [];
            let total = shieldControl;

            // get amount to fire at each enemy
            for (let i = 0; i < enemyArr.length; i++) {
                let enemyInfo = enemyArr[i];
                let valid = false;
                let amount;
                let remainingEnergy = this.player.powerGrid.energy - total;
                let remainingEnergyStr = Utility.ceilFloatAtFixedPoint(remainingEnergy, 1).toFixed(1);
                do {
                    if (total > 0) {
                        this.terminal.printLine(`Total energy = ${total}. Remaining Energy ${remainingEnergyStr}.`);
                    } else {
                        this.terminal.printLine(`Remaining Energy ${remainingEnergyStr}.`);
                    }

                    let locationString = `${enemyInfo.coordinates.userSectorX} - ${enemyInfo.coordinates.userSectorY}`;
                    let killAmount = Utility.ceilFloatAtFixedPoint(enemyInfo.amount, 1);
                    let response = await this.terminal.ask(`Amount to fire at ${enemyInfo.name} at ${locationString} (${killAmount.toFixed(1)} would kill) : `);
                    response = response.trim();
                    if (response == 0) {        // if blank or zero skip
                        valid = true;
                        amount = 0;
                    } else {    // if negative or nan show error
                        response = Number.parseFloat(response);
                        if (Number.isNaN(response) || response < 0) {
                            this.terminal.printLine("Please provide a positive number of units to fire. Zero or blank will skip the enemy.");
                        } else if (response > remainingEnergy) {
                            this.terminal.printLine(`We only have ${remainingEnergyStr} units available.`);
                        } else {
                            valid = true;
                            amount = response;
                        }
                    }
                } while (!valid);
                // add target
                if (amount > 0) {
                    enemyInfo.amount = amount;
                    targets.push(enemyInfo);
                    total += amount;
                }
            }

            if (targets.length === 0) {
                let again = await this.getConfirmation(this.terminal, `You didn't specify a target. Try again? `);
                if (again) return this.runInteractive();
                return;
            }

            // over heat warning
            if (total - shieldControl > this.player.phasers.overheatThreshold) {
                let go = await this.getConfirmation(this.terminal, `Firing ${total} could overheat our phasers, continue?`);
                if (!go) {
                    let goAgain = await this.getConfirmation(this.terminal, `Try again?`);
                    if (goAgain) return this.runInteractive();
                    return;
                }
            }
            // todo: confirm ?
            this.terminal.printLine("Firing phasers.");

            // fast shield control
            if (this.player.shields.up) this.fastShieldControl(leaveShieldsDown);

            // have our player fire away
            this.player.firePhasersMultiTarget(targets, false);
        } else {
            // get amount to fire then use the run auto method
            let amountToFire;
            let valid = false;
            do {
                let energyStr = Utility.ceilFloatAtFixedPoint(this.player.powerGrid.energy, 1).toFixed(1);
                this.terminal.printLine(`Available Energy ${energyStr}`);
                let response = await this.getFloats(this.terminal, `How much would you like to fire?`, 1);
                response = response[0];
                if(response <= 0) {
                    let cancel = await this.getConfirmation(this.terminal, `Cancel Command?`);
                    if(cancel) return;
                }
                if(response + shieldControl > this.player.powerGrid.energy) {
                    this.terminal.printLine(`We only have ${energyStr} energy available.`);
                } else {
                    valid = true;
                    amountToFire = response;
                }
            } while (!valid);

            // over heat warning
            if (amountToFire - shieldControl > this.player.phasers.overheatThreshold) {
                let go = await this.getConfirmation(this.terminal, `Firing ${amountToFire} could overheat our phasers, continue?`);
                if (!go) {
                    let goAgain = await this.getConfirmation(this.terminal, `Try again?`);
                    if (goAgain) return this.runInteractive();
                    return;
                }
            }
            // todo: confirm ?
            this.terminal.printLine("Firing phasers.");

            return this.runAuto(amountToFire, useShieldControl, shieldControl, leaveShieldsDown);
        }
    }

    fastShieldControl(noOption = false) {
        if (this.player.shields.up) {
            this.terminal.printLine(`Weapons Officer Sulu-  "High-speed shield control enabled, sir."`);
            // do fast shield control
            this.player.shields.lower();
            // lower shields
            if (noOption) {
                // leave shields down
                this.player.powerGrid.useEnergy(200);
            } else {
                this.player.shields.raise();    // costs 50
                this.player.powerGrid.useEnergy(150);
            }
        }
    }

    getEnemiesByDistance() {
        let enemies = this.player.gameObject.quadrant.container.getGameObjectsOfType(AbstractEnemy);
        let enemyArr = [];
        enemies.forEach(e => {
            let distance = Galaxy.calculateDistance(e.gameObject.sector, this.player.gameObject.sector);
            //calculate kill shot
            let energy = this.player.phasers.calculateSureKill(distance, e.collider.health);
            enemyArr.push({
                enemy: e,
                distance: distance,
                amount: energy,
                name: e.name,
                coordinates: e.gameObject.coordinates
            });
        });
        enemyArr.sort((a, b) => a.distance - b.distance);
        return enemyArr;
    }

    async runManual(amounts, useShieldControl, shieldControlEnergy, noOption) {
        // get amounts (phasers manual ...n
        let toFire = amounts.map(str => Number.parseInt(str));

        // parse, and check for errors
        let hasParseErrors = toFire.some(n => Number.isNaN(n));
        if (hasParseErrors) {
            this.terminal.printLine(`Try again.`);
            return this.runInteractive();
        }
        // filter out 0 values and negatives because they're pointless
        toFire = toFire.filter(n => n > 0);

        // check that we have that much energy to fire
        let total = toFire.reduce((carry, n) => carry + n, 0) + shieldControlEnergy;
        if (total > this.player.powerGrid.energy) {
            this.terminal.printLine(`Units available = ${this.player.powerGrid.energy}.`);
            return this.runInteractive();
        }

        // sort entries by distance
        let enemyArr = this.getEnemiesByDistance();

        // if they specified more targets than
        if (enemyArr.length < toFire.length) {
            this.terminal.printLine(`There are only ${enemyArr.length} enemies here.`);
            return this.runInteractive();
        }

        // now grab the entries that we're going to fire at
        let targetArray = [];
        for (let i = 0; i < toFire.length; i++) {
            let enemyEntry = enemyArr[i];
            enemyEntry.amount = toFire[i];
            targetArray.push(enemyEntry);
        }

        // fast shield control
        this.fastShieldControl(noOption);

        // have our player fire away
        this.player.firePhasersMultiTarget(targetArray, false);
    }

    async runAuto(amount, useShieldControl, shieldControlEnergy, noOption) {
        // in automatic mode the ship automatically fires kill shots
        // at each target, closest first, until the energy amount
        // specified is expended
        if (Number.isNaN(amount)) {
            this.terminal.printLine(`Try again.`);
            return this.runInteractive();
        } else if (amount <= 0) {
            this.terminal.printLine(`Can't fire ${amount}, specify an amount greater than 0.`);
            return this.runInteractive();
        } else if (amount + shieldControlEnergy > this.player.powerGrid.energy) {
            this.terminal.printLine(`We only have units available = ${this.player.powerGrid.energy}.`);
            return this.runInteractive();
        }
        // sort entries by distance
        let enemyArr = this.getEnemiesByDistance();

        // fire kill shots until the amount of energy to use is exhausted
        // add the entries into toFire, until we run out of energy
        let toFire = [];
        let amountToFire = amount;
        for (let i = 0; amount > 0 && i < enemyArr.length; i++) {
            let {amount} = enemyArr[i];
            if (amountToFire < amount) {
                amount = amountToFire;
            }
            // amount = Math.ceil(amount);
            amountToFire -= amount;
            enemyArr[i].amount = amount;
            toFire.push(enemyArr[i]);
            if (amountToFire <= 0) {
                break;
            }
        }
        this.fastShieldControl(noOption);

        this.player.firePhasersMultiTarget(toFire);

        // fire excess energy into space
        if (amountToFire > 0) {
            this.terminal.echo(`Firing ${amountToFire.toFixed(2)} excess units into space.`);
            this.player.powerGrid.useEnergy(amountToFire);
        }
    }

    run() {
        // find enemies to fire upon, check that we can fire on something
        let quadrant = this.player.gameObject.quadrant;
        let enemies = quadrant.container.getGameObjectsOfType(AbstractEnemy);
        if (enemies.length === 0) {
            // this.terminal.printLine("No enemies to fire upon.");
            // return;
        }

        // figure out the mode
        let args = this.terminal.getArguments();
        if(args.length === 0) {
            return this.runInteractive();
        }

        let {auto, manual} = this.parseMode(args);
        let {no} = this.options.parseOption(args);

        // automatic is assumed
        let amounts = [];
        if (!auto && !manual) {
            auto = true;
            amounts = args.slice(0);  // no mode option specified in args
        } else {
            amounts = args.slice(1);  // ignore mode option specified in args
        }

        let shieldControl = 200;
        if (no) shieldControl -= 50;
        let useShieldControl = this.player.shields.up;
        if (!useShieldControl) shieldControl = 0;

        // strip out the options
        if (auto) {
            let amount = Number.parseInt(amounts[0]);
            return this.runAuto(amount, useShieldControl, shieldControl, no);
        } else if (manual) {
            return this.runManual(amounts, useShieldControl, shieldControl, no);
        }
    }
}