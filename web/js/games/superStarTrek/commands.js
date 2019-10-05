// command structure
// abbreviation (alias for command entry)
// name (command name used for entry )
// helpName (the title of the help file)
// device used
// full name (the full name of the command)
// options ?
// exact matcher
import {AbstractKlingon, Klingon, KlingonCommander, KlingonSuperCommander, Romulan} from "./Enemies/Enemies.js";
import StarBase from "./Objects/StarBase.js";
import Star from "./Objects/Star.js";
import Enterprise from "./PlayerShips/Enterprise.js";
import Planet from "./Objects/Planet.js";
import BlackHole from "./Objects/BlackHole.js";

export function optionRegexifier(...strings) {
  strings = strings.sort((a, b) => b.length - a.length);
  return new RegExp(`^\\s*(${strings.join("|")})\\s*$`, 'i');
}
export function regexifier(...strings) {
  // sort the possible command names by length that way
  // it'll match the longest possible thing first
  strings = strings.sort((a, b) => b.length - a.length);
  return new RegExp(`^\\s*(${strings.join("|")})\\s*`, 'i');
}
// what to do for options

// todo:: make command classes
class Command {
  constructor() {
    // defaults
    this.abbreviation =  null;
    this.name = null;
    this.regex = null;
    this.fullName = null;
    this.deviceUsed = "";
    this.options =  {};
    this.info = "No info.";
  }
  formatGrid() {}
  concatGrid() {}
  run(commandObj) {
    commandObj.out = "Not implemented.";
    return commandObj;
  }
}
export class GetHelpCommand extends Command {
  constructor(game, terminal) {
    super();
    this.game = game;
    this.terminal = terminal;
    this.abbreviation = "help";
    this.name = "help";
    this.regex = regexifier("help");
    this.fullName = "ask for help";
    this.info = `  Mnemonic:  HELP
  Full command:  HELP <command>

This command reads the appropriate section from the SST.DOC file,
providing the file is in the current directory.`;
  }
  run(commandObj) {
    let out = "\n";
    let arg = commandObj.arguments[0];
    // prompt
    if(!arg) {
      commandObj.ps = "Help on what command?";
      commandObj.next = this.name;
      return commandObj;
    }

    // get the relevant command by name
    let command = this.game.commands.find(c => c.name === arg);
    if(command) {
      out += `Spock- "Captain, I've found the following information:"\n\n`;
      // todo:: implement the page scrolling stuff 
      out += command.info;
    } else {
      out += "Valid Commands:\n";
      // if invalid list the valid commands
      let matrix = [];
      let row = [];
      let rowLength = 4;
      this.game.commands.forEach(c => {
        // make a new row
        if(row.length === rowLength) {
          matrix.push(row);
          row = [];
        }
        row.push(`${c.name}`);
      });
      if(row.length > 0) {
        matrix.push(row);
      }
      let formatted = this.terminal.format_grid(matrix, false);
      out += this.terminal.print_grid(formatted);
    }
    out += "\n";
    commandObj.out = out;
    return commandObj;
  }
}

export class MoveCommand extends Command {
  constructor(game, terminal) {
    super();
    this.game = game;
    this.terminal = terminal;
    this.abbreviation = "";
    this.name = "move";
    this.regex = regexifier("m", "move");
    this.fullName = "move under warp drive";
    this.info = `  Mnemonic:  MOVE
  Shortest abbreviation:  M
  Full command:  MOVE MANUAL <displacement>
                 MOVE AUTOMATIC <destination>

This command is the usual way to move from one place to another
within the galaxy.  You move under warp drive, according to the
current warp factor (see "WARP FACTOR").

There are two command modes for movement: MANUAL and AUTOMATIC.  The
manual mode requires the following format:

        MOVE MANUAL <deltax> <deltay>

<deltax> and <deltay> are the horizontal and vertical displacements
for your starship, in quadrants; a displacement of one sector is 0.1
quadrants.  Specifying <deltax> and <deltay> causes your ship to move
in a straight line to the specified destination. If <deltay> is
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

        MOVE AUTOMATIC <qrow> <qcol> <srow> <scol>

where <qrow> and <qcol> are the row and column numbers of the
destination quadrant, and <srow> and <scol> are the row and column
numbers of the destination sector in that quadrant.  This command also
moves your ship in a straight line path to the destination.  For
moving within a quadrant, <qrow> and <qcol> may be omitted. For
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

}
export class StatusCommand extends Command {
  constructor(game, terminal) {
    super();
    this.game = game;
    this.terminal = terminal;
    this.abbreviation = 'st';
    this.name =  'status';
    this.regex =  regexifier("st", "status", "status report");
    this.fullName =  'status report';
    this.info =  `Mnemonic:  STATUS
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
  run(commandObj) {
    let output = "\n";
    output += this.game.getStatusText().join("\n");
    commandObj.out = output;
    return commandObj;
  }
}
export class RequestCommand  extends Command {
  constructor(game, terminal) {
    super();
    this.terminal = terminal;
    this.game = game;
    this.name = "request";
    this.abbreviation = "req";
    this.regex = regexifier("req", "request", "request information");
    this.fullName = "request information";
    this.arguments = 1;
    this.info = `Mnemonic:  REQUEST
  Shortest abbreviation:  REQ
  Full command:  REQUEST <ITEM>

This command allows you to get any single piece of information from
the <STATUS> command.  <ITEM> specifies which information as follows:

 INFORMATION       MNEMONIC FOR <ITEM>           SHORTEST ABBREVIATION

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
  run(commandObj) {
    let out = "";
    let request = commandObj.arguments[0];
    // ask
    if(!request) {
      commandObj.ps = "Information desired? ";
      commandObj.next = this.name;
      return commandObj;
    }

    // otherwise
    let status = this.game.getStatusText();
    let date = optionRegexifier('date', "d");
    let condition = optionRegexifier("condition", "c");
    let position = optionRegexifier("position", "p");
    let lifeSupport = optionRegexifier("lsupport", "l");
    let warpFactor = optionRegexifier("warpfactor", "w");
    let energy = optionRegexifier("energy", "e");
    let torpedoes = optionRegexifier("torpedoes", "t");
    let shields = optionRegexifier("shields", "s");
    let klingonsRemaining = optionRegexifier("klingons", "s");
    let timeLeft = optionRegexifier("time", "ti");

    if(date.test(request)) {
      out = status[0];
    } else if (condition.test(request)) {
      out = status[1];
    } else if (position.test(request)) {
      out = status[2];
    } else if (lifeSupport.test(request)) {
      out = status[3];
    } else if (warpFactor.test(request)) {
      out = status[4];
    } else if (energy.test(request)) {
      out =  status[5];
    } else if (torpedoes.test(request)) {
      out =  status[6];
    } else if (shields.test(request)) {
      out =  status[7];
    } else if (klingonsRemaining.test(request)) {
      out =  status[8];
    } else if (timeLeft.test(request)) {
      out =  status[9];
    } else {
      out = "UNRECOGNIZED REQUEST. Legal requests are:\n" +
          "  date, condition, position, lsupport, warpfactor,\n" +
          "  energy, torpedoes, shields, klingons, time.\n"
    }
    commandObj.out = out;
    return commandObj;
  }
}
export class ChartCommand extends Command {
  constructor(game, terminal) {
    super();
    this.terminal = terminal;
    this.game = game;
    this.abbreviation =  "c";
    this.name =  "chart";
    this.regex =  regexifier("c", "chart", "star chart");
    this.fullName =  "star chart";
    this.info =  `As you proceed in the game, you learn more and more about what things
    are where in the galaxy. When ever you first do a scan in a quadrant,
    telemetry sensors are ejected which will report any changes in the
    quadrant(s) back to your ship, providing the sub-space radio is
    working. Spock will enter this information in the chart. If the radio
    is not working, Spock can only enter new information discovered from
    scans, and information in other quadrants may be obsolete.

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

    return this.terminal.format_grid(grid).map(row => row.join("  ")).join("\n");
  }
  run(commandObj) {
    super.run(commandObj);
    let output = "\nSTAR CHART FOR THE KNOWN GALAXY\n";
    output += "\n";
    output += this.makeChartText();
    commandObj.out = output;
    return commandObj;
  }
}
export class ShortRangeScanCommand extends Command {
  constructor(game, terminal, chartCommand) {
    super();
    this.terminal = terminal;
    this.game = game;
    this.chartCommand = chartCommand;
    this.abbreviation= "s";
    this.name= "srscan";
    this.regex =  regexifier("s", "srscan", "short range scan");
    this.fullName = "short range scan";
    this.options =  {
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
    this.info =  `Mnemonic:  SRSCAN
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
          3  . . . . . * . B . .  Position      5 - 1, 2 - 4
          4  . . . S . . . . . .  Life Support  DAMAGED, Reserves=2.30
          5  . . . . . . . K . .  Warp Factor   5.0
          6  . K .   . . . . * .  Energy        2176.24
          7  . . . . . P . . . .  Torpedoes     3
          8  . . . . * . . . . .  Shields       UP, 42% 1050.0 units
          9  . * . . * . . . C .  Klingons Left 12
         10  . . . . . . . . . .  Time Left     3.72


    The left part is a picture of the quadrant.  The E at sector 2 - 4
    represents the Enterprise; the B at sector 3 - 8 is a starbase.
    There are ordinary Klingons (K) at sectors 5 - 8 and 6 - 2, and a
    Klingon Commander (C) at 9 - 9.  The (GULP) "Super-commander" (S) is
    occupies sector 4 - 4, and a Romulan (R) is at 1 - 6.  A planet (P)
    is at sector 7 - 6.  There are also a large number of stars (*). The
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
    short-range scan anytime you like.

    If your short-range sensors are damaged, this command will only show
    the contents of adjacent sectors.`;
  }
  run(commandObj) {
    super.run(commandObj);
    // get the options
    let no = optionRegexifier("n", "no");
    let printStatus = true;
    if(no.test(commandObj.argumentStr)) {
      printStatus = false;
    }
    let chart = optionRegexifier("c", "chart");
    let printChart = false;
    if(chart.test(commandObj.argumentStr)) {
      printChart = true;
    }



    let output = "";
    // use player location
    let quadrant = this.game.player.gameObject.quadrant;
    let matrix = [];
    for(let i = 0; i < quadrant.sectors.length; i++) {
      let textRow = [];
      quadrant.sectors[i].forEach(sector => {
        let obj = sector.container.getAllGameObjects()[0];
        if(!obj) {
          textRow.push('.');
        } else if(obj instanceof Klingon) {
          textRow.push('K');
        }else if (obj instanceof KlingonCommander) {
          textRow.push("C");
        } else if (obj instanceof  KlingonSuperCommander) {
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
    // this.terminal.echo("\n");
    output += "\n";
    // format the grid so the spacing is correct
    matrix = this.terminal.format_grid(matrix);
    // todo:: print chart
    // add status info
    if(printStatus) {
      // join the row together, add separators
      matrix = matrix.map(row => row.join(" "));
      // skip the header rows, then add the status text line by line
      let statusLines = this.game.getStatusText();
      statusLines.forEach((line, i) => {
        matrix[i + 1] += "\t" + line;
      })
      // join the rows with \n
      let text = matrix.join("\n");
      // print
      // this.terminal.echo(text);
      output += text;
    } else {
      output += this.terminal.format_grid(matrix);
    }
    // print out the star chart if requested
    if(printChart) {
      output += "\n\n";
      output += this.chartCommand.makeChartText();
    }
    output += "\n\n";
    commandObj.out = output;
    return commandObj;
  }
}
export class LongRangeScanCommand extends Command {
  constructor(game, terminal) {
    super();
    this.terminal = terminal;
    this.game = game;
    this.abbreviation =  "l";
    this.name =  "lrscan";
    this.regex =  regexifier("l", "lrscan", "long range scan");
    this.fullName =  "Long Range Scan";
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
    super.run(commandObj);
    let output = "";
    // todo:: save info
    // use player location
    let playerQuadrant = this.game.player.gameObject.quadrant;
    // get a 3 x 3 quadrant matrix with the player at the center
    let matrix = [];
    for(let y = playerQuadrant.y - 1; y <= playerQuadrant.y + 1; y++) {
      let textRow = [];

      for(let x = playerQuadrant.x - 1; x <=playerQuadrant.x + 1; x++) {
        let quadrant = null;
        try {
          quadrant = this.game.galaxy.getQuadrant(x, y)
          if(!quadrant) {
            textRow.push(`-1`); //out of bounds
          } else {
            let num = 0;
            let superNovaText = quadrant.hasSupernova ? "1" : " ";
            // let superNovaText = quadrant.hasSupernova ? 1 : 0;
            // num += superNovaText * 1000;
            let klingonText = quadrant.container.getCountOfGameObjects(
                AbstractKlingon
            );
            num += klingonText *100;
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
        } catch(e) {
          textRow.push(`-1`); //out of bounds
        }
      }
      matrix.push(textRow);
    }
    output += `\nLong-range scan for Quadrant ${playerQuadrant.y} - ${playerQuadrant.x}\n\n`;
    let txt = this.terminal.format_grid(matrix).map(row => row.join("\t")).join("\n");
    output += txt;
    output += "\n";
    commandObj.out = output;
    return commandObj;
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
