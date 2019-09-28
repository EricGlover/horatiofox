import Service from "./utils/Service.js";
// help menu
// read sst.txt for info

// todo:: add command prompt
export default class Game {
  constructor(terminal, features) {
    this.terminal = terminal;
    this.service = new Service();
  }
  start() {
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

  async runCommand(command) {
    switch (command) {
      case "help":
        this.getHelp(command);
        break;
      default:
        alert("command not found");
    }
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
let commands = [
  {
    abbreviation: "ABANDON",
    name: "ABANDON",
    deviceUsed: "shuttle craft",
    helpName: "abandon"
  },
  "srscan",
  "lrscan",
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
];
