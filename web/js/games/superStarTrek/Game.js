import Service from "./utils/Service.js";
import { commands } from "./commands.js";
import { Galaxy } from "./Galaxy.js";
import { GameObject } from "./Components.js";
import Star from "./Objects/Star.js";
import StarBase from "./Objects/StarBase.js";

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
    this.playerLocation = [3, 4];
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

          // randomly place a star
          let sectorY = Math.round(Math.random() * (quadrant.length - 1));
          let sectorX = Math.round(Math.random() * (quadrant.width - 1));
          // get the sector
          let sector = this.galaxy.getSector(j, i, sectorY, sectorX);
          star.gameObject.placeIn(this.galaxy, sector.quadrant, sector);
        }
      });
    });
  }

  makePlanets() {
    // todo
    /*
    // Locate planets in galaxy
	for (i = 1; i <= inplan; i++) {
		do iran8(&ix, &iy);
		while (d.newstuf[ix][iy] > 0);
		d.newstuf[ix][iy] = 1;
		d.plnets[i].x = ix;
		d.plnets[i].y = iy;
		d.plnets[i].pclass = Rand()*3.0 + 1.0; // Planet class M N or O
		d.plnets[i].crystals = 1.5*Rand();		// 1 in 3 chance of crystals
		d.plnets[i].known = 0;
	}
  */
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
          let sector = quadrant.getRandomSector();
          newBase.gameObject.placeIn(this.galaxy, quadrant, sector);
          bases.push(newBase);
        }
      }
    }

    // todo:: update the star chart to show a base (we always know where bases are)
  }

  makeKlingons() {}

  start() {
    // register commands
    this.registerCommands();

    // these methods should probably be on the game .... whatever
    // do some setup for our galaxy, make the immovable objects
    // stars, planets, bases
    this.makeStars();
    this.makePlanets();
    this.makeBases();

    /// make our moveable object (klingons, klingonCommanders, Romulans)
    this.makeKlingons();

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
        let klingonText = 0; //quadrant.container.getGameObjectsOfType(Klingon);
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
