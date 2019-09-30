import Service from "./utils/Service.js";
import { commands } from "./commands.js";
import { Galaxy } from "./Galaxy.js";
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

  start() {
    // register commands
    this.registerCommands();
    // change terminal settings
    let startText = `It is stardate 3100. The Federation is being attacked by
a deadly Klingon invasion force. As captain of the United
Starship U.S.S. Enterprise, it is your mission to seek out
and destroy this invasion force of 2 battle cruisers.
You have an initial allotment of 7 stardates to complete
your mission.  As you proceed you may be given more time.

You will have 4 supporting starbases.
Starbase locations-   7 - 2   5 - 3   3 - 8   1 - 1

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
        let superNovaText = quadrant.hasSupernova ? "1" : ".";
        let klingonText = quadrant.getNumberOfKlingons();
        let starbaseText = quadrant.getNumberOfStarbases();
        let starText = quadrant.getNumberOfStars();
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
