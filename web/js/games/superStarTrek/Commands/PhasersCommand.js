// then add the no option (if no appears anywh  ere then don't raise shields using high speed control)
import {Command, regexifier, ATTACK_COMMAND} from "./Command.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";

export class PhasersCommand extends Command {
    constructor(game, terminal, player) {
        super('p', 'phasers', 'fire phasers', ATTACK_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.addOption("no", "n", "no");
        this.addMode("auto", "a", "auto", "automatic");
        this.addMode("manual", "m", "man", "manual");
        this._info = `
Full commands:  PHASERS AUTOMATIC [AMOUNT TO FIRE] (NO)
                PHASERS [AMOUNT TO FIRE] (NO)
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

    run() {
        // find enemies to fire upon, check that we can fire on something
        let quadrant = this.player.gameObject.quadrant;
        let playerSector = this.player.gameObject.sector;
        let enemies = quadrant.container.getGameObjectsOfType(AbstractEnemy);
        if (enemies.length === 0) {
            this.terminal.printLine("No enemies to fire upon.");
            return;
        }

        // figure out the mode
        let args = this.terminal.getArguments();
        let {auto, manual} = this.parseMode(args);
        let {no} = this.parseOption(args);
        let noOption = no;

        // automatic is assumed
        let amounts = [];
        if (!auto && !manual) {
            auto = true;
            amounts = args.slice(0);  // no mode option specified in args
        } else {
            amounts = args.slice(1);  // ignore mode option specified in args
        }

        let shieldControl = 200;
        // if(no) shieldControl = 150;

        // strip out the options
        if (auto) {
            // in automatic mode the ship automatically fires kill shots
            // at each target, closest first, until the energy amount
            // specified is expended
            let amount = Number.parseInt(amounts[0]);
            if (Number.isNaN(amount)) {
                this.terminal.printLine(`Try again.`);
                return;
            } else if (amount <= 0) {
                this.terminal.printLine(`Can't fire ${amount}, specify an amount greater than 0.`);
                return;
            } else if (amount + shieldControl > this.player.powerGrid.energy) {
                this.terminal.printLine(`Units available = ${this.player.powerGrid.energy}.`);
                return;
            }
            // sort entries by distance
            let enemyArr = [];
            enemies.forEach(e => {
                let distance = Galaxy.calculateDistance(e.gameObject.sector, playerSector);
                //calculate kill shot
                let energy = this.player.phasers.calculateSureKill(distance, e.collider.health);
                enemyArr.push({
                    enemy: e,
                    distance: distance,
                    amount: energy
                });
            });
            enemyArr.sort((a, b) => a.distance - b.distance);
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
            // fast shield control
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

            this.player.firePhasersMultiTarget(toFire);

            // fire excess energy into space
            if (amountToFire > 0) {
                this.terminal.echo(`Firing ${amountToFire.toFixed(2)} excess units into space.`);
                this.player.powerGrid.useEnergy(amountToFire);
            }
            //
        } else if (manual) {
            // get amounts (phasers manual ...n
            let toFire = amounts.map(str => Number.parseInt(str));

            // parse, and check for errors
            let hasParseErrors = toFire.some(n => Number.isNaN(n));
            if (hasParseErrors) {
                this.terminal.printLine(`Try again.`);
                return;
            }
            // filter out 0 values and negatives because they're pointless
            toFire = toFire.filter(n => n > 0);

            // check that we have that much energy to fire
            let total = toFire.reduce((carry, n) => carry + n, 0);
            if (total + shieldControl > this.player.powerGrid.energy) {
                this.terminal.printLine(`Units available = ${this.player.powerGrid.energy}.`);
                return;
            }

            // if they specified more targets than
            if (enemies.length < toFire.length) {
                this.terminal.printLine(`There are only ${enemies.length} enemies here.`);
                return;
            }

            // sort entries by distance
            let enemyArr = [];
            enemies.forEach(e => {
                enemyArr.push({
                    enemy: e,
                    distance: Galaxy.calculateDistance(e.gameObject.sector, playerSector),
                    amount: null
                });
            });
            enemyArr.sort((a, b) => a.distance - b.distance);

            // now grab the entries that we're going to fire at
            let targetArray = [];
            for (let i = 0; i < toFire.length; i++) {
                let enemyEntry = enemyArr[i];
                enemyEntry.amount = toFire[i];
                targetArray.push(enemyEntry);
            }

            // fast shield control
            if (this.player.shields.up) {
                this.terminal.printLine(`Weapons Officer Sulu-  "High-speed shield control enabled, sir."`);
                // do fast shield control
                this.player.shields.shieldsDown();
                // lower shields
                if (noOption) {
                    // leave shields down
                    this.player.powerGrid.useEnergy(200);
                } else {
                    this.player.shieldsUp();    // costs 50
                    this.player.powerGrid.useEnergy(150);
                }
            }

            // have our player fire away
            this.player.firePhasersMultiTarget(targetArray, false);
        }
    }
}