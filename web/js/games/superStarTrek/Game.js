import Service from "./utils/Service.js";
import { commands } from "./commands.js";
import { Galaxy } from "./Galaxy.js";
import { GameObject } from "./Components.js";
import Star from "./Objects/Star.js";
import StarBase from "./Objects/StarBase.js";
import Planet from "./Objects/Planet.js";
import BlackHole from "./Objects/BlackHole.js";
import {
  AbstractKlingon,
  Klingon,
  KlingonCommander,
  KlingonSuperCommander,
  Romulan
} from "./Enemies/Enemies.js";

/** Game length options **/
const GAME_LENGTH_SHORT = 1;
const GAME_LENGTH_MEDIUM = 2;
const GAME_LENGTH_LONG = 4;

/** Difficulty options **/
const SKILL_NOVICE = 1;
const SKILL_FAIR = 2;
const SKILL_GOOD = 3;
const SKILL_EXPERT = 4;
const SKILL_EMERITUS = 5;

// help menu
// read sst.txt for info

// todo:: add command prompt
export default class Game {
  constructor(terminal, features) {
    this.terminal = terminal;
    this.service = new Service();
    this.galaxy = new Galaxy(8, 8, true);
    this.commands = commands;
    // todo:: switch this out when we have a player
    // player location stub
    // defaults for testing
    this.playerLocation = [3, 4];
    this.length = GAME_LENGTH_SHORT;
    this.daysRemaining = this.length * 7;
    this.skill = SKILL_NOVICE;
  }
  // generate number of stuff first ?
  // todo::
  calculate() {
    //enemies
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
    if (numberOfEnemies > 50) {
      // add a base
    }
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
    let numberOfRomulans = Math.round(2.0 * Math.random() * this.skill);
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
      let commander = new KlingonSuperCommander();
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
      let commander = new KlingonCommander();
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
    let usedQuadrants = [];
    while (n > 0) {
      // debugger;
      // get a random quadrant without klingons
      // technically we could infinite loop here but whatever
      let quadrant;
      let alreadyUsed;
      do {
        quadrant = this.galaxy.getRandomQuadrant();
        alreadyUsed = usedQuadrants.some(q => q === quadrant);
      } while (alreadyUsed);

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
        let klingon = new Klingon();
        klingon.gameObject.placeIn(this.galaxy, quadrant, sector);
        n--;
      }
    }
  }

  makeRomulans(n) {
    for (let i = 0; i < n; i++) {
      let quadrant = this.galaxy.getRandomQuadrant();
      let sector = quadrant.getRandomEmptySector();
      let romulan = new Romulan();
      console.log("placing romulan");
      romulan.gameObject.placeIn(this.galaxy, quadrant, sector);
    }
  }

  start() {
    // register commands
    this.registerCommands();

    // these methods should probably be on the game .... whatever
    // do some setup for our galaxy, make the immovable objects
    // stars, planets, bases
    this.makeStars();
    this.makePlanets();
    this.makeBases();
    this.makeBlackHoles();

    /// make our moveable object (klingons, klingonCommanders, Romulans)
    this.makeEnemies();

    let starBases = this.galaxy.container.getGameObjectsOfType(StarBase);
    // quadrants are listed y - x
    let sbq = starBases.map(base =>
      [base.gameObject.quadrant.y, base.gameObject.quadrant.x].join(" - ")
    );
    let baseStr = sbq.join("   ");
    // change terminal settings
    let startText = `It is stardate 3100. The Federation is being attacked by
a deadly Klingon invasion force. As captain of the United
Starship U.S.S. Enterprise, it is your mission to seek out
and destroy this invasion force of 2 battle cruisers.
You have an initial allotment of 7 stardates to complete
your mission.  As you proceed you may be given more time.

You will have ${starBases.length} supporting starbases.
Starbase locations-   ${baseStr}

The Enterprise is currently in Quadrant 5 - 3  Sector 8 - 7

Good Luck!
`;
    this.terminal.echo(startText);
  }

  registerCommands() {
    this.commands.forEach(command => {
      // debugger;
      this.terminal.register("command", {
        name: command.name,
        method: (...args) => {
          console.log("running ", command.name);
          // return {
          //   ps: "whoa: ? : ",
          //   in: "dank input",
          //   out: "things happened"
          // };
        },
        regex: command.regex
      });
      // todo:: options ???
      // this is set as a callback so that the current command
      // that they entered is printed before we
      // start echoing out output
      // we could've used the out in the command obj but whatever
      this.terminal.register("callback", {
        name: command.name,
        method: (...args) => this.runCommand(command.name, ...args),
        regex: command.regex
      });
    });
  }

  runCommand(command, commandObj) {
    // debugger;
    switch (command) {
      case "help":
        // get the command they're asking for help on
        debugger;
        this.getHelp(commandObj);
        break;
      case "chart":
        this.runChart(commandObj);
        break;
      case "srscan":
        this.runShortRangeScan(commandObj);
        break;
      case "lrscan":
        this.runLongRangeScan(commandObj);
        break;
      default:
        alert("command not found");
    }
    return { out: "dank" };
  }

  // print the galaxy star chart
  // for the moment this prints out the actual info
  runChart() {
    this.terminal.echo("\nSTAR CHART FOR THE KNOWN GALAXY\n");

    // use galaxy to make a grid of text
    let grid = [];
    // convert each row to text
    for (let i = 0; i < this.galaxy.length; i++) {
      let row = this.galaxy.getRow(i);
      let textRow = [];
      // convert each quadrant to text
      row.forEach(quadrant => {
        // todo
        let superNovaText = "."; //quadrant.hasSupernova ? "1" : ".";
        let klingonText = quadrant.container.getCountOfGameObjects(
          AbstractKlingon
        ); // 0; //quadrant.container.getGameObjectsOfType(Klingon);
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
    // for (let i = 0; i < grid.length; i++) {
    //   grid[i].unshift(`${i + 1} -`);
    //   grid[i].push("-");
    // }

    // add header rows to indicate column #s
    // make sure to account for the extra column
    let headerRow = ["    "];
    let rowLength = grid[0].length;
    // skip first and last columns
    for (let i = 1; i < rowLength - 1; i++) {
      headerRow.push(`  ${i} `);
    }

    let h2 = ["    "];
    // skip first and last columns
    for (let i = 1; i < rowLength - 1; i++) {
      h2.push(`----`);
    }
    grid.unshift(h2);
    grid.unshift(headerRow);

    this.terminal.print_grid(grid, "   ");
  }

  // print the quandrant
  runShortRangeScan() {
    // use player location
  }

  // print nearby quandrants
  runLongRangeScan() {
    // use player location
  }

  async getHelp() {
    try {
      let helpText = this.service.getHelp();
      this.terminal.echo(helpText);
    } catch (e) {
      //defaultErrorHandler(e);
    }
  }
}

// todo:: fill out info for commands
// setup command options
// setup our terminal for the commands
// tie in the getHelp info stuffz
/**
 * commands
 *
 **/
