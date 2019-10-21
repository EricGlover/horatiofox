import Service from "./utils/Service.js";
import {Galaxy} from "./Galaxy.js";
import Enterprise from "./PlayerShips/Enterprise.js";
import Star from "./Objects/Star.js";
import StarBase from "./Objects/StarBase.js";
import Planet from "./Objects/Planet.js";
import BlackHole from "./Objects/BlackHole.js";
import {
    AbstractKlingon,
    Klingon,
    KlingonCommander,
    KlingonSuperCommander,
    Romulan,
    AbstractEnemy
} from "./Enemies/Enemies.js";

import {
    PhotonsCommand,
    DockCommand,
    PhasersCommand,
    ShieldsCommand,
    CommandsCommand,
    MoveCommand,
    GetHelpCommand,
    ChartCommand,
    LongRangeScanCommand, ReportCommand, ScoreCommand,
    RequestCommand, ShortRangeScanCommand, StatusCommand
} from "./commands.js";

import {DEBUG} from './superStarTrek.js';
import {WarpFactorCommand} from "./commands";


/** Game length options **/
export const GAME_LENGTH_SHORT = 1;
export const GAME_LENGTH_MEDIUM = 2;
export const GAME_LENGTH_LONG = 4;

/** Difficulty options **/
export const SKILL_NOVICE = 1;
export const SKILL_FAIR = 2;
export const SKILL_GOOD = 3;
export const SKILL_EXPERT = 4;
export const SKILL_EMERITUS = 5;

/** Game Mode **/
export const GAME_MODE_REGULAR = 1;
export const GAME_MODE_TOURNAMENT = 2;
export const GAME_MODE_FROZEN = 3;


/**
 *
 */
export default class Game {
    constructor(terminal, features) {
        this.terminal = terminal;
        this.service = new Service();
        this.galaxy = new Galaxy(8, 8, 10, 10, true);
        this.commands = [];

        // place player in random quad and sector
        this.player = new Enterprise(this.terminal);
        if (DEBUG) {
            // testing torpedoes
            let quad = this.galaxy.getQuadrant(0, 0);
            let sector = quad.getSector(4, 4);
            this.player.gameObject.placeIn(this.galaxy, quad, sector);

            // place a klingon
            // k 1
            sector = quad.getSector(0, 0);
            let klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            // k 2
            sector = quad.getSector(9, 0);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            // k 3
            sector = quad.getSector(9, 9);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            // k 4
            sector = quad.getSector(0, 9);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            // top right bottom left
            sector = quad.getSector(4, 0);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            sector = quad.getSector(9, 4);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            sector = quad.getSector(4, 9);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);
            sector = quad.getSector(0, 4);
            klingon = new Klingon(this.galaxy, this.player, this);
            klingon.gameObject.placeIn(this.galaxy, quad, sector);

        } else {
            let quad = this.galaxy.getRandomQuadrant();
            let sector = quad.getRandomSector();
            this.player.gameObject.placeIn(this.galaxy, quad, sector);
        }

        // defaults for testing
        this.length = GAME_LENGTH_SHORT;
        this.initialStarDate = 100.0 * (31.0 * Math.random() + 20.0);
        this.starDate = this.initialStarDate;
        this.timeRemaining = 7;
        this.skill = SKILL_NOVICE;
        this.secretPassword = null;

        // user input stuff
        this.resolveUserCommand = null; // our promise function for awaiting input

        // initial counts of enemies
        this.initialEnemies = null;
        this.initialKlingons = null;
        this.initialCommanders = null;
        this.initialSuperCommands = null;
        this.initialRomulans = null;
        this.fallenFoes = [];

        this.federationPowerRemaining = null;
    }

    calculateKlingonStrength() {
        let remainingKlingons = this.galaxy.container.getCountOfGameObjects(Klingon);
        let remainingCommanders = this.galaxy.container.getCountOfGameObjects(KlingonCommander);
        return remainingKlingons + (remainingCommanders * 4);
    }

    decrementFederationPower(timePassed) {
        this.federationPowerRemaining -= timePassed * this.calculateKlingonStrength();
    }

    recalculateTimeRemaining() {
        // resources is the way that federation power is tracked
        // given the enemy strength federation power will be exhausted by the end of the remaining time
        this.timeRemaining = this.federationPowerRemaining / this.calculateKlingonStrength();
    }

    elapseTime(days) {
        this.starDate += days;
        this.decrementFederationPower(days);
        this.recalculateTimeRemaining();
    }

    calculateScore() {
        let killedKlingonsAll = this.getNumberOfTypeKilled(AbstractKlingon);
        let killedKlingons = this.getNumberOfTypeKilled(Klingon);
        let killedCommanders = this.getNumberOfTypeKilled(KlingonCommander);
        let killedSuperCommanders = this.getNumberOfTypeKilled(KlingonSuperCommander);
        let killedRomulans = this.getNumberOfTypeKilled(Romulan);
        let score = killedKlingons * 10 + killedCommanders * 50 + killedSuperCommanders * 200;
        score += killedRomulans * 20;

        let timeElapsed = this.starDate - this.initialStarDate;
        if(timeElapsed === 0) timeElapsed = 1;
        let klingonsPerDate = killedKlingonsAll / timeElapsed;
        score += klingonsPerDate * 500;

        // victory adds 100 * skill
        if(this.isVictory()) {
            score += this.skill * 100;
        }
        if(this.player.isDead()) {
            score -= 200;
        }
        return score;
    }

    getGameLengthStr() {
        switch(this.length) {
            case GAME_LENGTH_SHORT:
                return 'short';
            case GAME_LENGTH_MEDIUM:
                return 'medium';
            case GAME_LENGTH_LONG:
                return 'long';
            default:
                console.error("unknown game length");
        }
    }

    getDifficultyStr() {
        switch (this.skill) {
            case SKILL_NOVICE:
                return 'novice';
            case SKILL_FAIR:
                return 'fair';
            case SKILL_GOOD:
                return 'good';
            case SKILL_EXPERT:
                return 'expert';
            case SKILL_EMERITUS:
                return 'emeritus';
            default:
                console.error("unknown difficulty");
        }
    }

    killEnemy(enemy) {
        this.fallenFoes.push(enemy);
    }

    getNumberOfTypeKilled(type) {
        return this.fallenFoes.reduce((carry, foe) => {
            if(foe instanceof type) carry++;
            return carry;
        }, 0);
    }

    setup() {
        this.makeCommands();

        // these methods should probably be on the game .... whatever
        // do some setup for our galaxy, make the immovable objects
        // stars, planets, bases
        this.makeStars();
        this.makePlanets();
        this.makeBases();
        this.makeBlackHoles();

        /// make our moveable object (klingons, klingonCommanders, Romulans)
        this.makeEnemies();

        // set time remaining, and federation power
        //
        this.timeRemaining = 7 * this.length;
        this.federationPowerRemaining = this.calculateKlingonStrength() * this.timeRemaining;

        // technically this should be last so we can't have users trying to do stuff
        this.registerCommands();
        this.loop();
    }

    start() {
        this.setup();

        let starBases = this.galaxy.container.getGameObjectsOfType(StarBase);
        // quadrants are listed x - y
        let sbq = starBases.map(base =>
            [base.gameObject.quadrant.x + 1, base.gameObject.quadrant.y + 1].join(" - ")
        );

        let baseStr = sbq.join("   ");
        // change terminal settings
        let startText = `It is stardate ${this.starDate.toFixed(0)}. Federation is being attacked by
a deadly Klingon invasion force. As captain of the United
Starship U.S.S. Enterprise, it is your mission to seek out
and destroy this invasion force of ${this.numberOfKlingons} klingons.

The Klingons will overpower the Federation in ${this.timeRemaining} days, every Klingon you destroy will 
weaken this invasion force and buy us more time.

You will have ${starBases.length} supporting starbases.
Starbase locations-   ${baseStr}

The Enterprise is currently in ${this.player.gameObject.getLocation()}

TRY TYPING "COMMANDS"

Good Luck!
`;
        this.terminal.$terminal.echo(startText);
    }

    // if there are enemies in the player's current quadrant
    isInCombat() {
        let quadrant = this.player.gameObject.quadrant;
        return quadrant.container.getCountOfGameObjects(AbstractEnemy) > 0;
    }

    // maybe this could be a generator function
    // or use generator functions
    async loop() {
        let wasInCombat = false;

        while(!this.isDefeat() && !this.isVictory()) {
            // user turn
            let userTurn = true;
            let hasMovedInCombat = false;
            let justArrivedIntoCombat = false;
            let inCombat = false;
            while(userTurn && !this.isVictory() && !this.isDefeat()) {
                let {command, commandObj} = await this.terminal.runUserCommand();
                debugger;
                // when does the command run ?

                // info commands and instant ship commands (like scan or set warp) never consume a turn
                if(command.isInfoCommand() || command.isInstantShipCommand()) {
                    continue;
                }
                // update time remaining in case the balance of power has shifted
                this.recalculateTimeRemaining();

                inCombat = this.isInCombat();
                // don't let the ai shoot us when we don't let them shoot us immediately
                justArrivedIntoCombat = inCombat && !wasInCombat;

                // in combat you can move, then attack
                if(inCombat) {
                    if (command.isMoveCommand()) {
                        // if we already moved in combat, or just arrived into combat
                        // then moves consume a turn
                        if(hasMovedInCombat || !wasInCombat) {
                            userTurn = false;
                        }
                        hasMovedInCombat = true;
                    } else if (command.isAttackCommand()) {
                        userTurn = false;
                    } else {
                        userTurn = false;
                    }
                } else {    // if not in combat then keep going I guess ?
                    hasMovedInCombat = false;
                    continue;
                }
            }

            if(this.isVictory() || this.isDefeat()) break;

            // now it's the ai's turn, start shooting if we're in combat
            if(inCombat && !justArrivedIntoCombat) {
                this.player.gameObject.quadrant.container.getGameObjectsOfType(AbstractEnemy).forEach(enemy => {
                    enemy.ai.takeTurn();
                });
            }
            wasInCombat = inCombat;
            this.terminal.print();
            // update time remaining in case the balance of power has shifted
            this.recalculateTimeRemaining();
        }
        let victory = this.isVictory();
        let defeat = this.isDefeat();

        // save a log of the game
        let score = this.calculateScore();
        this.service.createGameLog(score, victory);

        this.terminal.skipLine(2);

        // show end game screen
        if(victory) {
            this.terminal.printLine("You win!");
            this.terminal.printLine(`It is stardate ${this.starDate.toFixed(1)}.`);
            this.terminal.print();
        } else if (defeat) {
            this.terminal.printLine("You lose...");
            this.terminal.printLine(`It is stardate ${this.starDate.toFixed(1)}.`);
            if(this.timeRemaining <= 0) {
                this.terminal.printLine(`Your time has run out and the Federation has been conquered.
With your starship confiscated by the Klingon High Command, you relocate to a mining facility and learn to love gagh.`);
            } else if (this.player.isDead()) {
                this.terminal.printLine(`The Enterprise has been destroyed in battle.`);
                this.terminal.skipLine();
                this.terminal.printLine(`Dulce et decorum est pro patria mori.\nThe Federation will be destroyed.`);
                this.terminal.skipLine();
            }
            this.terminal.print();
        }

        //print score
        this.terminal.silent = false;
        let scorePrinter = new ScoreCommand(this, this.terminal, this.player);
        scorePrinter.run({});
        this.terminal.print();
    }

    // time ran out
    // enterprise destroyed
    isDefeat() {
        return this.player.isDead() || this.timeRemaining <= 0;
    }

    // destroy all klingons
    isVictory() {
        return this.galaxy.container.getCountOfGameObjects(AbstractKlingon) === 0;
    }

    makeCommands() {
        this.commands = [];
        let chartCommand = new ChartCommand(this, this.terminal, this.player);
        let commandsCommand = new CommandsCommand(this, this.terminal);
        let statusCommand = new StatusCommand(this, this.terminal, this.player, this.galaxy);
        this.commands.push(new ShieldsCommand(this, this.terminal, this.player));
        this.commands.push(commandsCommand);
        this.commands.push(statusCommand);
        this.commands.push(new RequestCommand(this, this.terminal, statusCommand));
        this.commands.push(chartCommand);
        this.commands.push(new ShortRangeScanCommand(this, this.terminal, chartCommand, statusCommand));
        if(DEBUG) {
            this.commands.push(new LongRangeScanCommand(this, this.terminal, this.player));
        }

        this.commands.push(new GetHelpCommand(this, this.terminal, commandsCommand));
        this.commands.push(new MoveCommand(this, this.terminal, this.player, this.galaxy));
        this.commands.push(new PhasersCommand(this, this.terminal, this.player));
        this.commands.push(new DockCommand(this, this.terminal, this.player));
        this.commands.push(new PhotonsCommand(this, this.terminal, this.player));
        this.commands.push(new ReportCommand(this, this.terminal, this.galaxy, this.player));
        this.commands.push(new ScoreCommand(this, this.terminal, this.player));
        this.commands.push(new WarpFactorCommand(this.terminal, this.player));
    }

    // register all our commands with our terminal,
    // all commands get pass to runCommand with the command name
    // and the terminal's commandObj, we add a few things onto that object
    // note : we return the result of runCommand in case it wants to
    // modify the output
    registerCommands() {
        this.commands.forEach(command => {
            this.terminal.registerCommand(command);
        });
    }

    makeBlackHoles() {
        let blackHolesPerQuadrant = 3;
        this.galaxy.quadrants.forEach(row => {
            row.forEach(quad => {
                for (let i = 0; i < blackHolesPerQuadrant; i++) {
                    let sector = quad.getRandomEmptySector();
                    let b = new BlackHole();
                    b.gameObject.placeIn(this.galaxy, quad, sector);
                }
            });
        });
    }

    makeStars() {
        let minNumberOfStars = 1;
        let maxNumberOfStars = 9;

        // place random stars in each quadrant
        this.galaxy.quadrants.forEach((row, i) => {
            row.forEach((quadrant, j) => {
                // for this quandrant, randomly generate number of stars
                let numStars = Math.round(
                    Math.random() * (maxNumberOfStars - minNumberOfStars) +
                    minNumberOfStars
                );
                for (let s = 0; s < numStars; s++) {
                    let star = new Star();
                    let sector = quadrant.getRandomEmptySector();
                    if (!sector.container.isEmpty()) debugger;
                    star.gameObject.placeIn(this.galaxy, sector.quadrant, sector);
                }
            });
        });
    }

    // planets seem to be new ?
    makePlanets() {
        let minNumberOfPlanets = 5;
        let maxNumberOfPlanets = 10;
        let numberOfPlanets = Math.round(
            minNumberOfPlanets + (maxNumberOfPlanets / 3) * Math.random()
        );
        console.log(`number of planets = ${numberOfPlanets}`);

        // place planets
        for (
            let planetsPlaced = 0;
            planetsPlaced < numberOfPlanets;
            planetsPlaced++
        ) {
            // find a random quadrant without a planet
            let quadrant;
            do {
                quadrant = this.galaxy.getRandomQuadrant();
            } while (quadrant.container.getCountOfGameObjects(Planet) > 0);
            let sector = quadrant.getRandomEmptySector();
            // set up planet
            let planet = new Planet();
            planet.randomlyGenerate();

            // place in galaxy
            planet.gameObject.placeIn(this.galaxy, quadrant, sector);

            console.log(`planet at ${planet.gameObject.getLocation()}`);
        }
    }

    makeBases() {
        let minNumberOfBases = 2;
        let maxNumberOfBases = 5;
        let numberOfBases = Math.round(
            Math.random() * (maxNumberOfBases - minNumberOfBases) + minNumberOfBases
        );
        let bases = [];

        while (bases.length < numberOfBases) {
            // pick a quandrant
            let quadrant = this.galaxy.getRandomQuadrant();
            // if it doesn't already have a base
            if (quadrant.container.getCountOfGameObjects(StarBase) === 0) {
                // and if it's not too close to an existing base
                let tooClose = false;
                for (let i = 0; i < bases.length; i++) {
                    let previousBase = bases[i];
                    let previousQuadrant = previousBase.gameObject.quadrant;
                    let xDiff = quadrant.x - previousQuadrant.x;
                    let yDiff = quadrant.y - previousQuadrant.y;
                    let distanceSquared = xDiff * xDiff + yDiff * yDiff;
                    if (
                        distanceSquared < 6.0 * (6 - numberOfBases) &&
                        Math.random() < 0.75
                    ) {
                        tooClose = true;
                        break;
                    }
                }
                // then place a base in that quandrant
                if (!tooClose) {
                    // what sector ????
                    // for the moment choose a random sector
                    console.log("making starbase");
                    let newBase = new StarBase();
                    let sector = quadrant.getRandomEmptySector(); // todo:: check that sector is empty
                    newBase.gameObject.placeIn(this.galaxy, quadrant, sector);
                    bases.push(newBase);
                }
            }
        }
        // todo:: update the star chart to show a base (we always know where bases are)
    }

    makeEnemies() {
        let numberOfEnemies = Math.round(
            this.length *
            14 *
            ((this.skill + 1 - 2 * Math.random()) * this.skill * 0.1 + 0.15)
        );
        console.log(`number of enemies = ${numberOfEnemies}`);
        // split out the enemies into klingons and such
        let numberOfCommanders = Math.round(
            this.skill + 0.0625 * numberOfEnemies * Math.random()
        );
        let maxNumberOfCommanders = 10;
        numberOfCommanders = Math.min(maxNumberOfCommanders, numberOfCommanders);

        let numberOfSuperCommanders = this.skill > SKILL_FAIR ? 1 : 0;
        // make klingons
        let numberOfKlingons =
            numberOfEnemies - numberOfCommanders - numberOfSuperCommanders;
        this.numberOfKlingons = numberOfKlingons;
        let numberOfRomulans = Math.round(2.0 * Math.random() * this.skill);
        this.initialEnemies = numberOfEnemies;
        this.initialKlingons = numberOfKlingons;
        this.initialCommanders = numberOfCommanders;
        this.initialSuperCommands = numberOfSuperCommanders;
        this.initialRomulans = numberOfRomulans;
        this.makeKlingons(numberOfKlingons);
        this.makeKlingonCommanders(numberOfCommanders);
        this.makeKlingonSuperCommanders(numberOfSuperCommanders);
        this.makeRomulans(numberOfRomulans);
    }

    makeKlingonSuperCommanders(n) {
        // todo:::find a random quadrant with < 9 enemies in it
        // place in random sector
        // place in quadrant without enemies
        for (let i = 0; i < n; i++) {
            let quadrant;
            do {
                quadrant = this.galaxy.getRandomQuadrant();
            } while (quadrant.container.getCountOfGameObjects(AbstractKlingon) > 0);
            let commander = new KlingonSuperCommander(this.galaxy, this.player, this);
            let sector = quadrant.getRandomEmptySector();
            commander.gameObject.placeIn(this.galaxy, quadrant, sector);
            console.log("placing super commander");
        }
    }

    makeKlingonCommanders(n) {
        // place in quadrant without enemies
        for (let i = 0; i < n; i++) {
            let quadrant;
            do {
                quadrant = this.galaxy.getRandomQuadrant();
            } while (quadrant.container.getCountOfGameObjects(AbstractKlingon) > 0);
            let commander = new KlingonCommander(this.galaxy, this.player, this);
            let sector = quadrant.getRandomEmptySector();
            commander.gameObject.placeIn(this.galaxy, quadrant, sector);
            console.log("placing commander");
        }
    }

    makeKlingons(n) {
        // place klingons into quadrants in clumps
        let maxSize = 9;
        let clumpSize = Math.min(
            0.25 * this.skill * (9 - this.length) + 1,
            maxSize
        );
        // since we're getting a lot of random quadrants here
        // we'll not repeatedly call this.galaxy.getRandomly() and test
        let quadrants = this.galaxy.quadrants.flat();
        while (n > 0) {
            // get a random quadrant without klingons
            let idx = Math.round(Math.random() * (quadrants.length - 1 ));
            let quadrant = quadrants.splice(idx, 1)[0];
            if(!quadrant) { // if we somehow ran out of quadrants then just peace out
                break;  //
            }
            // randomize the amount of klingons to place a bit
            let r = Math.random();
            let toPlace = Math.round((1 - r * r) * clumpSize);
            toPlace = Math.min(toPlace, n);
            for (let i = 0; i < toPlace; i++) {
                // check if quadrant is full
                if (quadrant.isFull()) {
                    break;
                }
                // place klingons at random sectors (todo:: figure how they're actually dropped in)
                let sector = quadrant.getRandomEmptySector();
                console.log("placing klingon");
                let klingon = new Klingon(this.galaxy, this.player, this);
                klingon.gameObject.placeIn(this.galaxy, quadrant, sector);
                n--;
            }
        }
    }

    makeRomulans(n) {
        for (let i = 0; i < n; i++) {
            let quadrant = this.galaxy.getRandomQuadrant();
            let sector = quadrant.getRandomEmptySector();
            let romulan = new Romulan(this.galaxy, this.player, this);
            console.log("placing romulan");
            romulan.gameObject.placeIn(this.galaxy, quadrant, sector);
        }
    }
}