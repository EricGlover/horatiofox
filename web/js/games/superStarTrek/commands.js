// command structure
// abbreviation (alias for command entry)
// name (command name used for entry )
// helpName (the title of the help file)
// device used
// full name (the full name of the command)
// options ?
// exact matcher
import {
    AbstractEnemy,
    AbstractKlingon,
    Klingon,
    KlingonCommander,
    KlingonSuperCommander,
    Romulan
} from "./Enemies/Enemies.js";
import StarBase from "./Objects/StarBase.js";
import Star from "./Objects/Star.js";
import Enterprise from "./PlayerShips/Enterprise.js";
import Planet from "./Objects/Planet.js";
import BlackHole from "./Objects/BlackHole.js";
import {DEBUG} from "./superStarTrek.js";

// same thing as the regexifier but with the end of line character added
// so that you when we break apart the command by \s it identifies it correctly
export function optionRegexifier(...strings) {
    strings = strings.sort((a, b) => b.length - a.length);
    strings = strings.map(str => str + "\\s*"); // 0 or more white space characters
    return new RegExp(`^\\s*(${strings.join("|")})\\s*$`, 'i');
}

// handy function for taking a bunch of strings that work as aliases and
// making a regex to match any of them that begin a string
export function regexifier(...strings) {
    // sort the possible command names by length that way
    // it'll match the longest possible thing first
    strings = strings.sort((a, b) => b.length - a.length);
    strings = strings.map(str => str + "(\\s+|$)"); // one or more white space characters
    // otherwise p is matched when given the word "photons"
    // the capture group is so that "p" with no whitespace is still matched
    return new RegExp(`^\\s*(${strings.join("|")})\\s*`, 'i');
}

const INFO_COMMAND = "info";
const ATTACK_COMMAND = "attack";
const MOVE_COMMAND = "move";
const INSTANT_SHIP_COMMAND = "instant ship command";

// what to do for options
// todo:: make command classes
class Command {
    constructor() {
        // defaults
        this.abbreviation = null;
        this.name = null;
        this.regex = null;
        this.fullName = null;
        this.deviceUsed = "";
        this.options = {};
        this.info = "No info.";
        this.type = null;
        this.canAskQuestions = false;
    }

    isInstantShipCommand() {
        return this.type === INSTANT_SHIP_COMMAND;
    }

    isInfoCommand() {
        return this.type === INFO_COMMAND;
    }

    isAttackCommand() {
        return this.type === ATTACK_COMMAND;
    }

    isMoveCommand() {
        return this.type === MOVE_COMMAND;
    }

    run(commandObj) {
        commandObj.out = "Not implemented.";
        return commandObj;
    }

    makeInfo() {
        // set mnemonic shortest abbrev full name text
    }
}

export class WarpFactorCommand extends Command {
    constructor(terminal, player) {
        super();
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "w";
        this.name = "warp";
        this.fullName = "Warp Factor";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.type = INSTANT_SHIP_COMMAND;
        this.info = `
  Mnemonic:  WARP
  Shortest abbreviation:  W
  Full command:  WARP <number>

Your warp factor controls the speed of your starship.  The larger the
warp factor, the faster you go and the more energy you use.

Your minimum warp factor is 1.0 and your maximum warp factor is 10.0
(which is 100 times as fast and uses 1000 times as much energy).  At
speeds above warp 6 there is some danger of causing damage to your
warp engines; this damage is larger at higher warp factors and also
depends on how far you go at that warp factor.

At exactly warp 10 there is some probability of entering a so-called
"time warp" and being thrown forward or backward in time.  The farther
you go at warp 10, the greater is the probability of entering the
time warp.`
    }

    run(commandObj) {
        let warpFactor = Number.parseFloat(commandObj.arguments[0]);
        if (Number.isNaN(warpFactor)) {
            this.terminal.printLine("Beg your pardon, Captain?");
            return;
        }
        if (warpFactor < 1.0) {
            this.terminal.printLine(`Helmsman Sulu- "We can't go below warp 1, Captain."`);
        } else if (warpFactor <= 6.0) {
            this.terminal.printLine(`Helmsman Sulu- "Warp factor ${warpFactor.toFixed(1)}, Captain."`);
        } else if (warpFactor < 8.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, but our maximum safe speed is warp 6."`);
        } else if (warpFactor >= 8.0 && warpFactor < 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, but our engines may not take it."`);
        } else if (warpFactor === 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, we'll try it."`);
        } else if (warpFactor > 10.0) {
            this.terminal.printLine(`Helmsman Sulu- "Our top speed is warp 10, Captain."`);
        } else {
            this.terminal.printLine("Beg your pardon, Captain?");
            return;
        }
        this.player.setWarpFactor(warpFactor);
    }
}

export class ScoreCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "sc";
        this.name = "score";
        this.regex = regexifier(this.abbreviation, this.name);
        this.type = INFO_COMMAND;
        this.info = `
  Mnemonic:  SCORE
  Shortest abbreviation: SC

Shows what the score would be if the game were to end naturally at
this point. Since the game hasn't really ended and you lose points if
you quit, this is perhaps a meaningless command, but it gives you a
general idea of how well you are performing.
        `
    }

    run(commandObj) {
        let score = 0;
        let killedKlingonsAll = this.game.getNumberOfTypeKilled(AbstractKlingon);
        let killedKlingons = this.game.getNumberOfTypeKilled(Klingon);
        let kScore = killedKlingons * 10;
        let killedCommanders = this.game.getNumberOfTypeKilled(KlingonCommander);
        let cScore = killedCommanders * 50;
        let killedSuperCommanders = this.game.getNumberOfTypeKilled(KlingonSuperCommander);
        let scScore = killedSuperCommanders * 200;
        let killedRomulans = this.game.getNumberOfTypeKilled(Romulan);
        let romulanScore = killedRomulans * 20;
        score += kScore + cScore + scScore + romulanScore;

        let timeElapsed = this.game.starDate - this.game.initialStarDate;
        if (timeElapsed === 0) timeElapsed = 1;
        let klingonsPerDate = killedKlingonsAll / timeElapsed;
        let kPerDateScore = klingonsPerDate * 500;
        score += kPerDateScore;

        let lineLength = 60;
        this.terminal.printLine('Your score --');
        // make these strings fixed length
        this.terminal.printLine(`${killedRomulans} Romulan ships destroyed`.padEnd(lineLength, ' ') + romulanScore);
        this.terminal.printLine(`${killedKlingons} Klingon war birds destroyed`.padEnd(lineLength, ' ') + kScore);
        this.terminal.printLine(`${killedCommanders} Klingon Commander ships destroyed`.padEnd(lineLength, ' ') + cScore);
        this.terminal.printLine(`${killedSuperCommanders} Klingon Super Commander ships destroyed`.padEnd(lineLength) + scScore);
        this.terminal.printLine(`${klingonsPerDate.toFixed(2)} Klingons per stardate`.padEnd(lineLength) + kPerDateScore);
        // victory adds 100 * skill
        if (this.game.isVictory()) {
            let v = this.game.skill * 100;
            score += v;
            this.terminal.printLine(`Bonus for winning ${this.game.getDifficultyStr()} game `.padEnd(lineLength) + v);
        }
        if (this.player.isDead()) {
            let d = -200;
            score += d;
            this.terminal.printLine(`Penalty for getting yourself killed`.padEnd(lineLength) + d);
        }
        this.terminal.skipLine(2);
        this.terminal.printLine(`TOTAL SCORE`.padEnd(lineLength) + score.toFixed(0));
    }
}

export class ReportCommand extends Command {
    constructor(game, terminal, galaxy, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.galaxy = galaxy;
        this.abbreviation = "rep";
        this.name = "report";
        this.regex = regexifier(this.abbreviation, this.name);
        this.type = INFO_COMMAND;
        this.info = `
    Mnemonic:  REPORT
    Shortest abbreviation: REP

This command supplies you with information about the state of the
current game.  Its purpose is to remind you of things that you have
learned during play, but may have forgotten, and cannot otherwise
retrieve if you are not playing at a hard-copy terminal.

     You are told the following things:

       . The length and skill level of the game you are playing
       . The original number of Klingons
       . How many Klingons you have destroyed
       . Whether the Super-Commander has been destroyed
       . How many bases have been destroyed
       . How many bases are left
       . What bases (if any) are under attack; your subspace radio
         must have been working since the attack to get this 
         information.
       . How many casualties you have suffered
       . How many times you have called for help.

This same information is automatically given to you when you start to
play a frozen game.`
    }

    run(commandObj) {
        this.terminal.printLine(`You are now playing a ${this.game.getGameLengthStr()} ${this.game.getDifficultyStr()} game.`);
        let killedKlingonsAll = this.game.getNumberOfTypeKilled(AbstractKlingon);
        let killedKlingons = this.game.getNumberOfTypeKilled(Klingon);
        let killedCommanders = this.game.getNumberOfTypeKilled(KlingonCommander);
        let killedSuperCommanders = this.game.getNumberOfTypeKilled(KlingonSuperCommander);

        this.terminal.printLine(`${killedKlingonsAll} of ${this.game.initialEnemies} klingons have been killed.`);
        this.terminal.printLine(`${killedKlingons} klingon warbirds killed.`);
        this.terminal.printLine(`${killedCommanders} klingon commanders killed.`);
        this.terminal.printLine(`${killedSuperCommanders} klingon super commanders killed.`);

        // remaining bases
        let remainingBases = this.galaxy.container.getCountOfGameObjects(StarBase);
        this.terminal.printLine(`There are ${remainingBases} remaining bases.`);
        // todo:: bases destroyed, bases under attack, casualties, times called for help
    }
}

// how do the commands and the player communicate ?
// how much logic should be in the command as opposed to the player ?


export class PhotonsCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "pho";
        this.name = "photon";
        this.fullName = "photon torpedoes";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName, "photons", "photon torpedo");
        this.deviceUsed = "";
        this.maxPerBurst = 3;
        this.options = {};
        this.type = ATTACK_COMMAND;
        this.info = `
  Mnemonic:  PHOTONS
  Shortest abbreviation:  PHO
  Full commands:  PHOTONS <NUMBER> <TARG1> <TARG2> <TARG3>

Photon torpedoes are projectile weapons--you either hit what you aim
at, or you don't.  There are no "partial hits".

One photon torpedo will usually kill one ordinary Klingon, but it
usually takes about two for a Klingon Commander.  Photon torpedoes
can also blow up stars and starbases, if you aren't careful.

You may fire photon torpedoes singly, or in bursts of two or three.
Each torpedo is individually targetable.  The computer will prompt
you, asking for the target sector for each torpedo.  Alternately, you
may specify each target in the command line.

Photon torpedoes cannot be aimed precisely--there is always some
randomness involved in the direction they go.  Photon torpedoes may
be fired with your shields up, but as they pass through the shields
they are randomly deflected from their intended course even more.

Photon torpedoes are proximity-fused.  The closer they explode to the
enemy, the more damage they do.  There is a hit "window" about one
sector wide.  If the torpedo misses the hit window, it does not
explode and the enemy is unaffected.  Photon torpedoes are only
effective within the quadrant.  They have no effect on things in
adjacent quadrants.

If more than one torpedo is fired and only one target sector is
specified, all torpedoes are fired at that sector.  For example, to
fire two torpedoes at sector 3 - 4, you type

     PHO 2 3 4           (or)           PHO 2 3 4 3 4

To fire torpedoes at, consecutively, sectors 2 - 6, 1 - 10, and 4 -
7, type

     PHO 3 2 6 1 10 4 7

There is no restriction to fire directly at a sector.  For example,
you can enter

       PHO 1 3 2.5

to aim between two sectors.  However, sector numbers must be 1 to 10
inclusive.

`;
    }

    run(commandObj) {
        // torpedo launcher is damaged
        if (this.player.photons.isDamaged()) {
            this.terminal.echo(`Torpedo launcher is damaged.`);
            return;
        }

        let args = commandObj.arguments;
        let number = args.shift();
        let targets = [];
        for (let i = 0; i < args.length; i += 2) {
            let x = Number.parseFloat(args[i]);
            let y = Number.parseFloat(args[i + 1]);
            if (Number.isNaN(x) || Number.isNaN(y)) {
                this.terminal.echo(`${x} or ${y} is not a number.`);
                return;
            }
            // check that those sector numbers make sense ???
            targets.push({x, y});
        }

        if (number > this.maxPerBurst) {
            this.terminal(`Maximum of ${this.maxPerBurst} torpedoes per burst.`);
            // todo:: supposed to go into interactive mode
            return;
        }

        // if number and args don't match
        if (targets.length === 1) {  // assume all torpedoes will be launched at same target
            // make copies
            while (targets.length < number) {
                let copy = Object.assign({}, targets[0]);
                targets.push(copy);
            }
        } else if (number < targets.length) {
            this.terminal.echo("Please specify destinations for every torpedo.");
            return;
        } else if (number > targets.length) {
            this.terminal.echo("Number of targets and the number to launch don't match.");
            return;
        }

        // not enough torpedoes
        if (number > this.player.photons.getTorpedoCount()) {
            this.terminal.echo(`You only have ${number} torpedoes.`);
            return;
        }

        // convert coordinates
        targets = targets.map(target => Galaxy.convertUserCoordinates(target.x, target.y));

        // fire photon torpedoes (translate coordinates)
        // this makes no sense
        // coordinate system changes incoming .....
        targets.forEach((target, i) => {
            this.terminal.echo(`\nTrack for torpedo number ${i + 1}:  `);
            this.player.photons.fire(target.x, target.y)
        });
    }
}

// then add the no option (if no appears anywh  ere then don't raise shields using high speed control)
export class PhasersCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.name = "phasers";
        this.abbreviation = "p";
        this.fullName = "phasers";
        this.regex = regexifier(this.name, this.abbreviation, this.fullName);
        this.type = ATTACK_COMMAND;
        this.info = `
  Mnemonic:  PHASERS
  Shortest abbreviation:  P
  Full commands:  PHASERS AUTOMATIC <AMOUNT TO FIRE> <NO>
                  PHASERS <AMOUNT TO FIRE> <NO>
                  PHASERS MANUAL <NO> <AMOUNT 1> <AMOUNT 2>...<AMOUNT N>

Phasers are energy weapons. As you fire phasers at Klingons, you
specify an "amount to fire" which is drawn from your energy reserves.
The amount of total hit required to kill an enemy is partly random.
but also depends on skill level.

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
your <amount to fire> among the Klingons present.  If phaser firing
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
\f                                                                       13
A safety interlock prevents phasers from being fired through the
shields.  If this were not so, the shields would contain your fire
and you would fry yourself.  However, you may utilize the
"high-speed shield control" to drop shields, fire phasers, and raise
shields before the enemy can react.  Since it takes more energy to
work the shields rapidly with a shot, it costs you 200 units of
energy each time you activate this control.  It is automatically
activated when you fire phasers while the shields are up. By
specifying the <no> option, shields are not raised after firing.

Phasers have no effect on starbases (which are shielded) or on stars.`;
    }

    getMode(arg) {
        let autoOption = optionRegexifier("automatic", "auto", "a");
        let manualOption = optionRegexifier("manual", "man", "m");
        return {
            auto: autoOption.test(arg),
            manual: manualOption.test(arg)
        }
    }

    run(commandObj) {
        // find enemies to fire upon, check that we can fire on something
        let quadrant = this.player.gameObject.quadrant;
        let playerSector = this.player.gameObject.sector;
        let enemies = quadrant.container.getGameObjectsOfType(AbstractEnemy);
        if (enemies.length === 0) {
            this.terminal.printLine("No enemies to fire upon.");
            return;
        }

        // figure out the mode
        let {auto, manual} = this.getMode(commandObj.arguments[0]);

        // automatic is assumed
        let amounts = [];
        if (!auto && !manual) {
            auto = true;
            amounts = commandObj.arguments.slice(0);  // no mode option specified in args
        } else {
            amounts = commandObj.arguments.slice(1);  // ignore mode option specified in args
        }

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
            } else if (amount > this.player.energy) {
                this.terminal.printLine(`Units available = ${this.player.energy}.`);
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
            this.player.firePhasersMultiTarget(toFire, false);
            if (amountToFire > 0) {
                // fire excess energy into space
                this.terminal.echo(`Firing ${amountToFire.toFixed(2)} excess units into space.`);
                this.player.useEnergy(amountToFire);
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
            if (total > this.player.energy) {
                this.terminal.printLine(`Units available = ${this.player.energy}.`);
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

            // have our player fire away
            this.player.firePhasersMultiTarget(targetArray, false);
        }
        return commandObj;
    }
}

// todo::: shields transfer command mode
export class ShieldsCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.name = "shields";
        this.abbreviation = "sh";
        this.fullName = "deflector shields";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.info = `  Mnemonic:  SHIELDS
  Shortest abbreviation:  SH
  Full commands:  SHIELDS UP
                  SHIELDS DOWN
                  SHIELDS CHARGE <amount of energy to put into the shields>
                  SHIELDS DRAIN  <amount of energy to take from the shields>

Your deflector shields are a defensive device to protect you from
Klingon attacks (and nearby novas).  As the shields protect you, they
gradually weaken.  A shield strength of 75%, for example, means that
the next time a Klingon hits you, your shields will deflect 75% of
the hit, and let 25% get through to hurt you.

It costs 50 units of energy to raise shields, nothing to lower them.
You may move with your shields up; this costs nothing under impulse
power, but doubles the energy required for warp drive.

Each time you raise or lower your shields, the Klingons have another
chance to attack.  Since shields do not raise and lower
instantaneously, the hits you receive will be intermediate between
what they would be if the shields were completely up or completely
down.

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
in the status) and the shields.  Thee word "TRANSFER" may be
abbreviated "T".  The amount of energy to transfer is the number of
units of energy you wish to take from the ship's energy and put into
the shields.  If you specify an negative number, energy is drained
from the shields to the ship.  Transferring energy constitutes a turn.
If you transfer energy to the shields while you are under attack,
they will be at the new energy level when you are next hit.

Enemy torpedoes hitting your ship explode on your shields (if they
are up) and have essentially the same effect as phaser hits.`;
    }

    getMode(arg) {
        let upOption = optionRegexifier("up", "u");
        let downOption = optionRegexifier("down", "d");
        let drainOption = optionRegexifier("drain", "dr");
        let chargeOption = optionRegexifier("charge", "c");

        return {
            up: upOption.test(arg),
            down: downOption.test(arg),
            drain: drainOption.test(arg),
            charge: chargeOption.test(arg)
        };
    }

    run(commandObj) {
        // get mode : up/down or transfer
        let {up, down, charge, drain} = this.getMode(commandObj.arguments[0]);

        if(!up && !down && !charge && !drain) {
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
            // get the amount to transfer
            let amount = commandObj.arguments[1];
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
            if(charge) {
                // need the energy
                if (this.player.energy < amount) {
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
                this.player.useEnergy(amount);
                playerShields.charge(amount);
            } else if (drain) {
                // check shield energy
                if(amount > playerShields.units) {
                    this.terminal.printLine("Not enough energy in shields. Draining what we have.");
                    amount = playerShields.units;
                }
                // check ship energy not already maxed out
                if(this.player.energy === this.player.energyCapacity) {
                    this.terminal.printLine("Ship energy already at max.");
                    return;
                }
                // check that we don't exceed ship energy capacity
                if(this.player.energy + amount > this.player.energyCapacity) {
                    this.terminal.printLine("That would exceed our ship energy capacity. Setting ship energy to maximum.");
                    amount = this.player.energyCapacity - this.player.energy;
                }

                playerShields.drain(amount);
                this.player.addEnergy(amount);
            }
        }
        return commandObj;
    }
}

export class CommandsCommand extends Command {
    constructor(game, terminal) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.name = "commands";
        this.regex = regexifier("commands");
        this.type = INFO_COMMAND;
        this.info = `
 ABBREV    FULL COMMAND                             DEVICE USED
 ------    ------------                             -----------
 C         CHART                                    (none)
 D         DOCK                                     (none)
 L         LRSCAN                                   long-range sensors
 M         MOVE [MANUAL] [DISPLACEMENT]             warp engines
           MOVE AUTOMATIC [DESTINATION]             warp engines and computer
 P         PHASERS [TOTAL AMOUNT]                   phasers and computer
           PHASERS AUTOMATIC [TOTAL AMOUNT]         phasers, computer, sr sensors
           PHASERS MANUAL [AMT1] [AMT2] ...         phasers
 PHO       PHOTONS [NUMBER] [TARGETS]               torpedo tubes 
 REP       REPORT                                   (none)
 REQ       REQUEST                                  (none)
 S         SRSCAN [NO or CHART]                     short-range sensors
 SH        SHIELDS [UP, DOWN, or TRANSFER]          deflector shields
 ST        STATUS                                   (none)

 L. R. Scan:   thousands digit:   supernova
               hundreds digit:    Klingons
               tens digit:        starbases
               ones digit:        stars
               period (.):        digit not known (star chart only)

Courses are given in manual mode in X - Y displacements; in automatic
    mode as destination quadrant and/or sector.  Manual mode is default.
Distances are given in quadrants.  A distance of one sector is 0.1 quadrant.
Ordinary Klingons have about 400 units of energy, Commanders about
    1200.  Romulans normally have about 800 units of energy, and the
    (GULP) "Super-Commander" has about 1800.
Phaser fire diminishes to about 60 percent at 5 sectors.  Up to 1500
    units may be fired in a single burst without danger of overheat.`
    }

    printCommands() {
        let matrix = [];
        let row = [];
        let rowLength = 4;
        this.game.commands.map(c => c.name).sort().forEach(name => {
            // make a new row
            if (row.length === rowLength) {
                matrix.push(row);
                row = [];
            }
            row.push(`${name}`);
        });
        if (row.length > 0) {
            matrix.push(row);
        }
        let formatted = this.terminal.formatGrid(matrix, false);
        return this.terminal.printGrid(formatted, "   ");
    }

    run(commandObj) {
        this.terminal.newLine();
        this.terminal.echo(this.printCommands());
        return commandObj;
    }
}

export class GetHelpCommand extends Command {
    constructor(game, terminal, commandsCommand) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.commandsCommand = commandsCommand;
        this.abbreviation = "help";
        this.name = "help";
        this.regex = regexifier("help");
        this.fullName = "ask for help";
        this.type = INFO_COMMAND;
        this.info = `  Mnemonic:  HELP
  Full command:  HELP [command]

This command reads the appropriate section from the SST.DOC file,
providing the file is in the current directory.`;
    }

    run(commandObj) {
        this.terminal.newLine();
        let arg = commandObj.arguments[0];
        // prompt
        if (!arg) {
            commandObj.ps = "Help on what command?";
            commandObj.next = this.name;
            return commandObj;
        }

        // get the relevant command by name
        let command = this.game.commands.find(c => c.name === arg);
        if (command) {
            this.terminal.echo(`Spock- "Captain, I've found the following information:"\n\n`);
            // todo:: implement the page scrolling stuff
            this.terminal.echo(command.info);
        } else {
            this.terminal.echo("Valid Commands:\n");
            this.terminal.echo(this.commandsCommand.printCommands());
            // if invalid list the valid commands

        }
        this.terminal.newLine();
        return commandObj;
    }
}

export class MoveCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.abbreviation = "";
        this.name = "move";
        this.regex = regexifier("m", "move");
        this.fullName = "move under warp drive";
        this.type = MOVE_COMMAND;
        this.canAskQuestions = true;
        this.info = `  Mnemonic:  MOVE
  Shortest abbreviation:  M
  Full command:  MOVE MANUAL [displacement]
                 MOVE AUTOMATIC [destination]

This command is the usual way to move from one place to another
within the galaxy.  You move under warp drive, according to the
current warp factor (see "WARP FACTOR").

There are two command modes for movement: MANUAL and AUTOMATIC.  The
manual mode requires the following format:

        MOVE MANUAL [deltax] [deltay]

[deltax] and [deltay] are the horizontal and vertical displacements
for your starship, in quadrants; a displacement of one sector is 0.1
quadrants.  Specifying [deltax] and [deltay] causes your ship to move
in a straight line to the specified destination. If [deltay] is
omitted, it is assumed zero. For example, the shortest possible
command to move one sector to the right would be

        M M .1

The following examples of manual movement refer to the short-range
scan shown earlier.

  Destination Sector    Manual Movement command
        3 - 1                   M M -.3 -.1
        2 - 1                   M M -.3
        1 - 2                   M M -.2 .1
        1 - 4                   M M 0 .1
  (leaving quadrant)            M M 0 .2


The automatic mode is as follows:

        MOVE AUTOMATIC [qrow] [qcol] [srow] [scol]

where [qrow] and [qcol] are the row and column numbers of the
destination quadrant, and [srow] and [scol] are the row and column
numbers of the destination sector in that quadrant.  This command also
moves your ship in a straight line path to the destination.  For
moving within a quadrant, [qrow] and [qcol] may be omitted. For
example, to move to sector 2 - 9 in the current quadrant, the
shortest command would be

        M A 2 9

To move to quadrant 3 - 7, sector 5 - 8, type

        M A 3 7 5 8

and it will be done.  In automatic mode, either two or four numbers
must be supplied.
\f                                                                       10
Automatic mode utilizes the ship's "battle computer."  If the
computer is damaged, manual movement must be used.

If warp engines are damaged less than 10 stardates (undocked) you can
still go warp 4.

It uses time and energy to move.  How much time and how much energy
depends on your current warp factor, the distance you move, and
whether your shields are up.  The higher the warp factor, the faster
you move, but higher warp factors require more energy.  You may move
with your shields up, but this doubles the energy required.

You can move within a quadrant without being attacked if you just
entered the quadrant or have bee attacked since your last move
command.  This enables you to move and hit them before they
retaliate.`;
    }

    * moveTo(sector) {
        // how do they do collisions ?
        // check path for objects
        // calculate distance, energy required and time expended
        let distance = Galaxy.calculateDistance(this.player.gameObject.sector, sector);
        let energy = .1 * distance * Math.pow(this.player.warpFactor, 3);
        if (this.player.shields.up) energy *= 2;

        if (this.player.energy < energy) {
            /** todo::
             * Engineering to bridge--
             We haven't the energy, but we could do it at warp 6,
             if you'll lower the shields.
             */
            this.terminal.printLine('Engineering to bridge--');
            this.terminal.printLine(`We haven't the energy for that.`);
            return;
        }

        let timeRequired = distance / Math.pow(this.player.warpFactor, 2);
        // if the move takes 80% or greater of the remaining time then warn them
        let percentOfRemaining = 100 * timeRequired / this.game.timeRemaining;
        if (percentOfRemaining > 80.0) {
            // todo::
            this.terminal.ask(`First Officer Spock- "Captain, I compute that such
  a trip would require approximately ${percentOfRemaining.toFixed(2)}% of our
  remaining time.  Are you sure this is wise?"`);
            let response = yield;
            if (/(yes|y)/i.test(response)) {
                this.terminal.printLine("To boldly go...");
            } else if (/(no|n)/i.test(response)) {
                this.terminal.printLine("Cancelling move.");
                return;
            }
        }


        this.player.warpTo(sector);

        this.game.elapseTime(timeRequired);
        // check bounds
        // compute deltaX and deltaY
        // if both === 0 do nothing
        // compute distance to travel
        // check resources (power & time)
        // if warp factor > 6
        // then calculate engine damage
        // calculate time warp if any
        // if time warps or engines take damage then check the travel path
        // for collisions
    }

    // manual mode
    * manual(deltaQx, deltaQy, deltaSx, deltaSy) {
        // calculate the destination
        try {
            let destination = this.player.mover.calculateDestination(deltaQx, deltaQy, deltaSx, deltaSy);
            let iter = this.moveTo(destination);
            if (!iter.next().done) {
                let response = yield;
                iter.next(response);
            }
        } catch (e) {
            this.terminal.printLine(e.message);
            return;
        }
    }

    // automatic mode
    * automatic(quadX, quadY, sectorX, sectorY) {
        try {
            // get sector
            let sector = this.galaxy.getSector(quadX, quadY, sectorX, sectorY);
            let iter = this.moveTo(sector);
            if (!iter.next().done) {
                let response = yield;
                iter.next(response);
            }
        } catch (e) {
            this.terminal.printLine(e.message);
            return;
        }
    }

    * run(commandObj) {
        // modes : manual and automatic
        let manual = true;
        let automatic = false;
        let manualOption = optionRegexifier("m", "manual");
        let automaticOption = optionRegexifier("a", "automatic");

        // remove mode option from arguments, if provided
        let args = commandObj.arguments;
        if (args.some(arg => manualOption.test(arg))) {
            manual = true;
            automatic = false;
            // remove matching arg
            args = args.filter(arg => !manualOption.test(arg))
        }
        if (args.some(arg => automaticOption.test(arg))) {
            manual = false;
            automatic = true;
            // remove matching arg
            args = args.filter(arg => !automaticOption.test(arg))
        }

        if (manual) {
            console.log("manual mode");
            // parse args, only two arguments
            if (args.length !== 2) {
                throw new Error("need y and x");
            }
            let [argX, argY] = args;
            // quadrant based args <deltaX> <deltaY>
            // fuck that I'm making them <deltaY> <deltaX> so that they're consistent
            let deltaQx = Math.trunc(argX);
            let deltaQy = Math.trunc(argY);
            let deltaSx = Math.trunc((argX * 10) % 10);
            let deltaSy = Math.trunc((argY * 10) % 10);
            // todo:: check bounds
            let iter = this.manual(deltaQx, deltaQy, deltaSx, deltaSy);
            if (!iter.next().done) {
                let response = yield;
                iter.next(response);
            }
        } else if (automatic) {
            console.log("automatic mode");
            // parse args <quadY> <quadX> <sectorY> <sectorX>
            // or just <sectorY> <sectorX>
            // todo:: check bounds
            args = args.map(str => Number.parseInt(str));
            // make sure to convert from the 1 based commands
            // to the 0 based coordinates
            if (args.length === 4) {
                let iter = this.automatic(args[0] - 1, args[1] - 1, args[2] - 1, args[3] - 1);
                if (!iter.next().done) {
                    let response = yield;
                    iter.next(response);
                }
            } else if (args.length === 2) {
                let quadrant = this.player.gameObject.quadrant;
                let iter = this.automatic(quadrant.x, quadrant.y, args[0] - 1, args[1] - 1);
                if (!iter.next().done) {
                    let response = yield;
                    iter.next(response);
                }
            }

        }
        return commandObj;
    }
}

export class StatusCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.abbreviation = 'st';
        this.name = 'status';
        this.regex = regexifier("st", "status", "status report");
        this.fullName = 'status report';
        this.type = INFO_COMMAND;
        this.info = `Mnemonic:  STATUS
  Shortest abbreviation: ST

This command gives you information about the current state of your
starship as follows:

  STARDATE - The current date. A stardate is the same as a day.

  CONDITION - There are four possible conditions:
        DOCKED - docked at starbase.
        RED    - in battle.
        YELLOW - low on energy (<1000 units)
        GREEN  - none of the above

  POSITION - Quadrant is given first, then sector

  LIFE SUPPORT - If "ACTIVE" then life support systems are
        functioning normally. If on "RESERVES" the number is how many
        stardates your reserve food, air, etc. will last--you must
        get repairs made or get to starbase before your reserves run
        out.

  WARP FACTOR - What your warp factor is currently set to.

  ENERGY - The amount of energy you have left. If it drops to zero,
        you die.

  TORPEDOES - How many photon torpedoes you have left.

  SHIELDS - Whether your shields are up or down, how strong they are
       (what percentage of a hit they can deflect), and shield
       energy.

  KLINGONS LEFT - How many of the Klingons are still out there.

  TIME LEFT - How long the Federation can hold out against the
        present number of Klingons; that is, how long until the end
        if you do nothing in the meantime.  If you kill Klingons
        quickly, this number will go up--if not, it will go down.  If
        it reaches zero, the federation is conquered and you lose.

Status information is free--it uses no time or energy, and if you are
in battle, the Klingons are not given another chance to hit you.

Status information can also be obtained by doing a short-range scan.
See the SRSCAN command for details.

Each item of information can be obtained singly by requesting it.
See REQUEST command for details.`;
    }

    /**
     * If your short-range sensors are damaged, this command will only show
     the contents of adjacent sectors.
     #define IHQUEST '?'  // mystery quest
     #define IHF 'F'  // ????
     #define IHT 'T'  // ????
     #define IHWEB '#'
     #define IHGREEN 'G'
     #define IHYELLOW 'Y'
     #define IHRED 'R'
     #define IHDOCKED 'D'
     COMMAND> s
     */
    getStatusText() {
        let date = `Stardate\t${this.game.starDate.toFixed(1)}`
        let condition = `Condition\t${this.player.printCondition()}`;

        let playerQuad = this.player.gameObject.quadrant;
        let playerSector = this.player.gameObject.sector;
        let hullIntegrity = `Hull Integrity\t${this.player.collider.health.toFixed(2)}`
        let position = `Position\t${playerQuad.x + 1} - ${playerQuad.y + 1}, ${playerSector.x + 1} - ${playerSector.y + 1}`;
        let lifeSupport = `Life Support\t${this.player.hasLifeSupport() ? 'ACTIVE' : 'FAILED'}`;
        let warpFactor = `Warp Factor\t${this.player.warpFactor.toFixed(1)}`;
        let energy = `Energy\t\t${this.player.energy.toFixed(2)}`;
        let torpedoes = `Torpedoes\t${this.player.photons.getTorpedoCount()}`;
        let shields = `Shields\t\t${this.player.shields.printInfo()}`;
        let klingonsRemaining = `Klingons Left\t${this.galaxy.container.getCountOfGameObjects(AbstractKlingon)}`;
        let timeLeft = `Time Left\t${this.game.timeRemaining.toFixed(2)}`;
        return [
            date,
            condition,
            position,
            lifeSupport,
            warpFactor,
            energy,
            hullIntegrity,
            torpedoes,
            shields,
            klingonsRemaining,
            timeLeft
        ];
    }

    run(commandObj) {
        this.terminal.newLine();
        this.terminal.echo(this.getStatusText().join("\n"));
        return commandObj;
    }
}

export class RequestCommand extends Command {
    constructor(game, terminal, statusCommand) {
        super();
        this.terminal = terminal;
        this.game = game;
        this.statusCommand = statusCommand;
        this.name = "request";
        this.abbreviation = "req";
        this.regex = regexifier("req", "request", "request information");
        this.fullName = "request information";
        this.arguments = 1;
        this.type = INFO_COMMAND;
        this.canAskQuestions = true;
        this.info = `Mnemonic:  REQUEST
  Shortest abbreviation:  REQ
  Full command:  REQUEST [ITEM]

This command allows you to get any single piece of information from
the [STATUS] command.  [ITEM] specifies which information as follows:

 INFORMATION       MNEMONIC FOR [ITEM]           SHORTEST ABBREVIATION

 STARDATE              DATE                                D
 CONDITION             CONDITION                           C
 POSITION              POSITION                            P
 LIFE SUPPORT          LSUPPORT                            L
 WARP FACTOR           WARPFACTOR                          W
 ENERGY                ENERGY                              E
 TORPEDOES             TORPEDOES                           T
 SHIELDS               SHIELDS                             S
 KLINGONS LEFT         KLINGONS                            K
 TIME LEFT             TIME                                TI`;
    }

    * run(commandObj) {
        let request = commandObj.arguments[0];
        // ask
        if (!request) {
            this.terminal.ask("Information desired? ");
            request = yield;
        }

        // otherwise
        let status = this.statusCommand.getStatusText();
        let date = optionRegexifier('date', "d");
        let condition = optionRegexifier("condition", "c");
        let position = optionRegexifier("position", "p");
        let lifeSupport = optionRegexifier("lsupport", "l");
        let warpFactor = optionRegexifier("warpfactor", "w");
        let energy = optionRegexifier("energy", "e");
        let hullIntegrity = optionRegexifier("hull", "health", "h");
        let torpedoes = optionRegexifier("torpedoes", "t");
        let shields = optionRegexifier("shields", "s");
        let klingonsRemaining = optionRegexifier("klingons", "s");
        let timeLeft = optionRegexifier("time", "ti");

        let output;
        if (date.test(request)) {
            output = status[0];
        } else if (condition.test(request)) {
            output = status[1];
        } else if (position.test(request)) {
            output = status[2];
        } else if (lifeSupport.test(request)) {
            output = status[3];
        } else if (warpFactor.test(request)) {
            output = status[4];
        } else if (energy.test(request)) {
            output = status[5];
        } else if (hullIntegrity.test(request)) {
            output = status[6];
        } else if (torpedoes.test(request)) {
            output = status[7];
        } else if (shields.test(request)) {
            output = status[8];
        } else if (klingonsRemaining.test(request)) {
            output = status[9];
        } else if (timeLeft.test(request)) {
            output = status[10];
        } else {
            output = "UNRECOGNIZED REQUEST. Legal requests are:\n" +
                "  date, condition, position, lsupport, warpfactor,\n" +
                "  energy, torpedoes, shields, klingons, time.\n"
        }
        this.terminal.echo(output);
        return commandObj;
    }
}

export class ChartCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.terminal = terminal;
        this.game = game;
        this.player = player;
        this.abbreviation = "c";
        this.name = "chart";
        this.regex = regexifier("c", "chart", "star chart");
        this.fullName = "star chart";
        this.type = INFO_COMMAND;
        this.info = `
      Mnemonic:  ${this.name}
      Shortest abbreviation:  ${this.abbreviation}
    The chart looks like an 8 by 8 array of numbers.  These numbers are
    interpreted exactly as they are on a long-range scan. A period (.) in
    place of a digit means you do not know that information yet.  For
    example, ... means you know nothing about the quadrant, while .1.
    means you know it contains a base, but an unknown number of Klingons
    and stars.

    Looking at the star chart is a free operation.  It costs neither time
    nor energy, and can be done safely whether in or out of battle.`;
    }

    makeChartText() {
        // use galaxy to make a grid of text
        let grid = [];
        // convert each row to text
        for (let i = 0; i < this.game.galaxy.length; i++) {
            let row = this.game.galaxy.getRow(i);
            let textRow = [];
            // convert each quadrant to text
            row.forEach(quadrant => {
                // todo
                let superNovaText = quadrant.hasSupernova ? "1" : ".";
                let klingonText = quadrant.container.getCountOfGameObjects(
                    AbstractKlingon
                );
                let starbaseText = quadrant.container.getCountOfGameObjects(StarBase);
                let starText = quadrant.container.getCountOfGameObjects(Star);
                let text = `${superNovaText}${klingonText}${starbaseText}${starText}`;
                textRow.push(text);
            });
            //add row to our print out
            grid.push(textRow);
        }

        // add column before and after to indicate row #s
        grid.forEach((row, i) => {
            row.unshift(`${i + 1} -`);
            row.push("-");
        });

        // add header rows to indicate column #s
        // make sure to account for the extra column
        let headerRow = [" "];
        let rowLength = grid[0].length;
        // skip first and last columns
        for (let i = 1; i < rowLength - 1; i++) {
            headerRow.push(`  ${i} `);
        }

        let h2 = [" "];
        // skip first and last columns
        for (let i = 1; i < rowLength - 1; i++) {
            h2.push(`----`);
        }
        grid.unshift(h2);
        grid.unshift(headerRow);

        return this.terminal.formatGrid(grid).map(row => row.join("  ")).join("\n");
    }

    run(commandObj) {
        this.terminal.echo("\nSTAR CHART FOR THE KNOWN GALAXY\n");
        this.terminal.newLine();
        this.terminal.printLine(this.makeChartText());
        this.terminal.printLine();
        this.terminal.printLine(`thousands digit:   supernova
hundreds digit:    Klingons
tens digit:        starbases
ones digit:        stars
period (.):        digit not known`);
        this.terminal.printLine();
        let q = this.player.gameObject.quadrant;
        this.terminal.printLine(`Enterprise is currently in ${this.player.gameObject.getQuadrantLocation()}`);
        this.terminal.printLine();
        return commandObj;
    }
}

export class ShortRangeScanCommand extends Command {
    constructor(game, terminal, chartCommand, statusCommand) {
        super();
        this.terminal = terminal;
        this.game = game;
        this.chartCommand = chartCommand;
        this.statusCommand = statusCommand;
        this.abbreviation = "s";
        this.name = "srscan";
        this.regex = regexifier("s", "srscan", "short range scan");
        this.fullName = "short range scan";
        this.type = INFO_COMMAND;
        this.options = {
            no: {
                abbreviation: "n",
                name: "no",
                description: "don't display status information"
            },
            chart: {
                abbreviation: "c",
                name: "no",
                description: "display star chart"
            }
        };
        this.info = `Mnemonic:  SRSCAN
    Shortest abbreviation:  S
    Full commands:  SRSCAN
                    SRSCAN NO
                    SRSCAN CHART
    The short-range scan gives you a considerable amount of information
    about the quadrant your starship is in.  A short-range scan is best
    described by an example.

             1 2 3 4 5 6 7 8 9 10
          1  * . . . . R . . . .  Stardate      2516.3
          2  . . . E . . . . . .  Condition     RED
          3  . . . . . * . B . .  Position      1 - 5, 4 - 2
          4  . . . S . . . . . .  Life Support  DAMAGED, Reserves=2.30
          5  . . . . . . . K . .  Warp Factor   5.0
          6  . K .   . . . . * .  Energy        2176.24
          7  . . . . . P . . . .  Torpedoes     3
          8  . . . . * . . . . .  Shields       UP, 42% 1050.0 units
          9  . * . . * . . . C .  Klingons Left 12
         10  . . . . . . . . . .  Time Left     3.72


    The left part is a picture of the quadrant.  The E at sector 4 - 2
    represents the Enterprise; the B at sector 8 - 3 is a starbase.
    There are ordinary Klingons (K) at sectors 8 - 5 and 2 - 6, and a
    Klingon Commander (C) at 9 - 9.  The (GULP) "Super-commander" (S) is
    occupies sector 4 - 4, and a Romulan (R) is at 6 - 1.  A planet (P)
    is at sector 6 - 7.  There are also a large number of stars (*). The
    periods (.) are just empty space--they are printed to help you get
    your bearings.  Sector 6 - 4 contains a black hole ( ).

    The information on the right is assorted status information. You can
    get this alone with the STATUS command.  The status information will
    be absent if you type "N" after SRSCAN.  Otherwise status information
    will be presented.

    If you type "C" after SRSCAN, you will be given a short-range scan
    and a Star Chart.

    Short-range scans are free.  That is, they use up no energy and no
    time.  If you are in battle, doing a short-range scan does not give
    the enemies another chance to hit you.  You can safely do a
    short-range scan anytime you like.`;
    }

    run(commandObj) {
        // get the options
        let no = optionRegexifier("n", "no");
        let printStatus = true;
        if (no.test(commandObj.argumentStr)) {
            printStatus = false;
        }
        let chart = optionRegexifier("c", "chart");
        let printChart = false;
        if (chart.test(commandObj.argumentStr)) {
            printChart = true;
        }

        // use player location
        let quadrant = this.game.player.gameObject.quadrant;
        let matrix = [];
        for (let i = 0; i < quadrant.sectors.length; i++) {
            let textRow = [];
            quadrant.sectors[i].forEach(sector => {
                let obj = sector.container.getAllGameObjects()[0];
                if (!obj) {
                    textRow.push('.');
                } else if (obj instanceof Klingon) {
                    textRow.push('K');
                } else if (obj instanceof KlingonCommander) {
                    textRow.push("C");
                } else if (obj instanceof KlingonSuperCommander) {
                    textRow.push("S");
                } else if (obj instanceof Romulan) {
                    textRow.push("R");
                } else if (obj instanceof Enterprise) {
                    textRow.push("E");
                } else if (obj instanceof Star) {
                    textRow.push("*");
                } else if (obj instanceof Planet) {
                    textRow.push("P");
                } else if (obj instanceof StarBase) {
                    textRow.push("B");
                } else if (obj instanceof BlackHole) {
                    textRow.push(" ");
                }
            });
            matrix.push(textRow);
        }
        // add left number column for y coord
        matrix.forEach((row, i) => {
            row.unshift(`${i + 1}`);
        });

        // add top row for x coord
        // make sure to account for the extra column
        let headerRow = [" "];
        let rowLength = matrix[0].length;
        // skip first and last columns
        for (let i = 1; i < rowLength; i++) {
            headerRow.push(`${i}`);
        }
        matrix.unshift(headerRow);

        // make the matrix from the sector
        this.terminal.newLine();
        // format the grid so the spacing is correct
        matrix = this.terminal.formatGrid(matrix);
        // todo:: print chart
        // add status info
        if (printStatus) {
            // join the row together, add separators
            matrix = matrix.map(row => row.join(" "));
            // skip the header rows, then add the status text line by line
            let statusLines = this.statusCommand.getStatusText();
            statusLines.forEach((line, i) => {
                matrix[i] += "\t" + line;
            })
            // join the rows with \n
            let text = matrix.join("\n");
            // print
            // this.terminal.echo(text);
            this.terminal.echo(text);
        } else {
            this.terminal.echo(this.terminal.formatGrid(matrix));
        }
        // print out the star chart if requested
        if (printChart) {
            this.terminal.echo("\n\n");
            this.terminal.echo(this.chartCommand.makeChartText());
        }
        this.terminal.newLine();
        this.terminal.newLine();
        this.terminal.printLine(". = nothing; K = klingon; C = commander; S = super commander; R = romulan; E = Enterprise;");
        this.terminal.printLine("* = star; p = planet; b = base; empty = black hole.");
        this.terminal.newLine();
    }
}

export class LongRangeScanCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.terminal = terminal;
        this.game = game;
        this.player = player;
        this.abbreviation = "l";
        this.name = "lrscan";
        this.regex = regexifier("l", "lrscan", "long range scan");
        this.fullName = "Long Range Scan";
        this.type = INFO_COMMAND;
        this.info = `  Mnemonic:  LRSCAN
      Shortest abbreviation:  L

    A long-range scan gives you general information about where you are
    and what is around you.  Here is an example output.

        Long-range scan for Quadrant 5 - 1
           -1  107  103
           -1  316    5
           -1  105 1000

    This scan says that you are in row 5, column 1 of the 8 by 8 galaxy.
    The numbers in the scan indicate how many of each kind of thing there
    is in your quadrant and all adjacent quadrants.  The digits are
    interpreted as follows.

        Thousands digit:  1000 indicates a supernova (only)
        Hundreds digit:   number of Klingons present
        Tens digit:       number of starbases present
        Ones digit:       number of stars present

    For example, in your quadrant (5 - 1) the number is 316, which
    indicates 3 Klingons, 1 starbase, and 6 stars.  The long-range
    scanner does not distinguish between ordinary Klingons and Klingon
    command ships.  If there is a supernova, as in the quadrant below and
    to your right (quadrant 6 - 2), there is nothing else in the
    quadrant.

    Romulans possess a "cloaking device" which prevents their detection
    by long-range scan.  Because of this fact, Starfleet Command is never
    sure how many Romulans are "out there".  When you kill the last
    Klingon, the remaining Romulans surrender to the Federation.

    Planets are also undetectable by long-range scan.  The only way to
    detect a planet is to find it in your current quadrant with the
    short-range sensors.

    Since you are in column 1, there are no quadrants to your left. The
    minus ones indicate the negative energy barrier at the edge of the
    galaxy, which you are not permitted to cross.

    Long-range scans are free.  They use up no energy or time, and can be
    done safely regardless of battle conditions.`;
    }

    run(commandObj) {
        // todo:: save info
        // use player location
        let playerQuadrant = this.game.player.gameObject.quadrant;
        // get a 3 x 3 quadrant matrix with the player at the center
        let matrix = [];
        for (let y = playerQuadrant.y - 1; y <= playerQuadrant.y + 1; y++) {
            let textRow = [];

            for (let x = playerQuadrant.x - 1; x <= playerQuadrant.x + 1; x++) {
                let quadrant = null;
                try {
                    quadrant = this.game.galaxy.getQuadrant(x, y)
                    if (!quadrant) {
                        textRow.push(`-1`); //out of bounds
                    } else {
                        let num = 0;
                        let superNovaText = quadrant.hasSupernova ? "1" : " ";
                        // let superNovaText = quadrant.hasSupernova ? 1 : 0;
                        // num += superNovaText * 1000;
                        let klingonText = quadrant.container.getCountOfGameObjects(
                            AbstractKlingon
                        );
                        num += klingonText * 100;
                        klingonText = klingonText === 0 ? ' ' : klingonText;

                        let starbaseText = quadrant.container.getCountOfGameObjects(StarBase);
                        // num += starbaseText * 10;
                        starbaseText = starbaseText === 0 ? ' ' : starbaseText;

                        let starText = quadrant.container.getCountOfGameObjects(Star);
                        starText = starText === 0 ? ' ' : starText;
                        // num += starbaseText;

                        let text = `${superNovaText}${klingonText}${starbaseText}${starText}`;
                        textRow.push(text);
                        // textRow.push("" + num);
                    }
                } catch (e) {
                    textRow.push(`-1`); //out of bounds
                }
            }
            matrix.push(textRow);
        }
        this.terminal.echo(`\nLong-range scan for ${this.player.gameObject.getQuadrantLocation()}\n\n`);
        let txt = this.terminal.formatGrid(matrix).map(row => row.join("\t")).join("\n");
        this.terminal.echo(txt);
        this.terminal.newLine();

        return commandObj;
    }
}

export class DockCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "d";
        this.name = "dock";
        this.fullName = "dock at starbase";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.deviceUsed = "";
        this.options = {};
        this.type = INFO_COMMAND;
        this.info = `
  Mnemonic:  DOCK
  Shortest abbreviation:  D

You may dock your starship whenever you are in one of the eight
sector positions immediately adjacent to a starbase.  When you dock,
your starship is resupplied with energy, shield energy photon
torpedoes.`;
    }

    run(commandObj) {
        if (this.player.docked) {
            this.terminal.echo("Already docked.");
            return;
        }
        // if you're in one of the eight adjacent sectors of a starbase
        // then "dock"
        let sector = this.player.gameObject.sector;
        let quadrant = this.player.gameObject.quadrant;

        let found = false;
        for (let x = sector.x - 1; x <= sector.x + 1; x++) {
            for (let y = sector.y - 1; y <= sector.y + 1; y++) {
                try {
                    let nearbySector = quadrant.getSector(x, y);
                    let starbase = nearbySector.container.getGameObjectsOfType(StarBase)[0];
                    if (starbase) {
                        found = true;
                        this.player.dock(starbase);
                        this.terminal.echo("Docked.");
                        break;
                    }
                } catch (e) {
                    // not found
                }
            }
            if (found) {
                break;
            }
        }
        if (!found) {
            this.terminal.echo(`${this.player.name} is not adjacent to a starbase.`);
        }
    }
}

/**
 {
  abbreviation: "",
  name: "",
  regex: null,
  fullName: ,
  devicedUsed: ,
  options: {},
  info: ``
}
 **/

/**
 Commands to make
 "phasers",
 "photons",
 "move",
 "shields",
 "dock",
 "damages",
 "chart",
 "impulse",
 "rest",
 "warp",
 "status",
 "sensors",
 "orbit",
 "transport",
 "mine",
 "crystals",
 "shuttle",
 "planets",
 "request",
 "report",
 "computer",
 "commands",
 "emexit",
 "probe",
 "cloak",
 "capture",
 "score",
 "abandon",
 "destruct",
 "freeze",
 "deathray",
 "debug",
 "call",
 "quit",
 "help"
 **/
