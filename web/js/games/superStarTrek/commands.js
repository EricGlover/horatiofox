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
// how do the commands and the player communicate ?
// how much logic should be in the command as opposed to the player ?


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
    //todo::
    return {
      auto: true,
      manual: false
    }
  }
  run(commandObj) {
    let out = "";

    // figure out the mode
    let {auto, manual} = this.getMode(commandObj.arguments[0]);
    if(auto) {

    } else if (manual) {

    } else {
      // shouldn't happen
      debugger;
    }
    commandObj.out = out;
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
                  SHIELDS TRANSFER <amount of energy to transfer>

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
    let transferOption = optionRegexifier("transfer", "t");

    return {
      up: upOption.test(arg),
      down: downOption.test(arg),
      transfer: transferOption.test(arg)
    };
  }
  run(commandObj) {
    let out = "\n";

    // get mode : up/down or transfer
    let {up, down, transfer} = this.getMode(commandObj.arguments[0]);

    if(up) {
      try {
        this.player.shieldsUp();
        out += "Shields raised.\n\n";
      } catch(e) {
        out += `${e.message}\n\n`;
      }
    } else if (down) {
      try {
        this.player.shieldsDown();
        out += "Shields lowered.\n\n";
      } catch(e) {
        out += `${e.message}\n\n`;
      }
    } else if (transfer) {
      // get the amount to transfer
      let amount = commandObj.arguments[1];
      amount = Number.parseInt(amount);
      if(Number.isNaN(amount)) {
        // parse error
        debugger;
      }
      // transfer energy from ship to shields, or vice versa
      // debugger;
      //
      let response = this.player.transferEnergyToShields(amount);
      if(response.message) {
        out += response.message;
      }
      // todo:: add the responses from Scotty
    } else if(!up && !down && !transfer) {
      debugger;
      // arg not provided, ask them questions
      // ask Do you wish to change shield energy?
      // if no , ask
      if(false) {
        let t = this.player.shields.up ? "up" : "down";
        let t2 = this.player.shields.up ? "down" : "up";
        let q2 = `Shields are ${t}. Do you want them ${t2}?`;
      }
    } else {
      // arg is provided but not recognized
    }
    commandObj.out = out;
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
    this.info = `
 ABBREV    FULL COMMAND                             DEVICE USED
 ------    ------------                             -----------
 ABANDON   ABANDON                                  shuttle craft
 C         CHART                                    (none)
 CA        CAPTURE                                  subspace radio, transporter
 CALL      CALL (for help)                          subspace radio
 CL        CLOAK                                    cloaking
 CO        COMPUTER                                 computer
 CR        CRYSTALS                                 (none)
 DA        DAMAGES                                  (none)
 DEATHRAY  DEATHRAY                                 (none)  
 DESTRUCT  DESTRUCT                                 computer
 D         DOCK                                     (none)
 E         EMEXIT                                   (none)
 FREEZE    FREEZE [FILE NAME]                       (none)
 I         IMPULSE [MANUAL] [DISPLACEMENT]          impulse engines
           IMPULSE AUTOMATIC [DESTINATION]          impulse engines and computer
 L         LRSCAN                                   long-range sensors
 MI        MINE                                     (none)
 M         MOVE [MANUAL] [DISPLACEMENT]             warp engines
           MOVE AUTOMATIC [DESTINATION]             warp engines and computer
 O         ORBIT                                    warp or impulse engines
 P         PHASERS [TOTAL AMOUNT]                   phasers and computer
           PHASERS AUTOMATIC [TOTAL AMOUNT]         phasers, computer, sr sensors
           PHASERS MANUAL [AMT1] [AMT2] ...         phasers
 PHO       PHOTONS [NUMBER] [TARGETS]               torpedo tubes 
 PL        PLANETS                                  (none)
 PR        PROBE [ARMED] [MANUAL] [DISPLACEMENT]    probe launcher, radio 
           PROBE [ARMED] AUTOMATIC [DESTINATION]    launcher, radio, computer
 REP       REPORT                                   (none)
 REQ       REQUEST                                  (none)
 R         REST [NUMBER OF STARDATES]               (none)
 QUIT      QUIT                                     (none)
 S         SRSCAN [NO or CHART]                     short-range sensors
 SC        SCORE                                    (none)
 SE        SENSORS                                  short-range sensors
 SH        SHIELDS [UP, DOWN, or TRANSFER]          deflector shields
 SHU       SHUTTLE                                  shuttle craft
 ST        STATUS                                   (none)
 T         TRANSPORT                                transporter
 W         WARP [FACTOR]                            (none)

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
    units may be fired in a single burst without danger of overheat.
Warp 6 is the fastest safe speed.  At higher speeds, engine damage
    may occur.  At warp 10 you may enter a time warp.
Shields cost 50 units of energy to raise, and double the power
    requirements of moving under warp drive.  Engaging the high-speed
    shield control requires 200 units of energy.
Warp drive requires (distance)*(warp factor cubed) units of energy
    to travel at a speed of (warp factor squared)/10 quadrants per stardate.
Impulse engines require 20 units to warm up, plus 100 units per
     quadrant.  Speed is just under one sector per stardate.`
  }
  printCommands() {
    let matrix = [];
    let row = [];
    let rowLength = 4;
    this.game.commands.map(c => c.name).sort().forEach(name => {
      // make a new row
      if(row.length === rowLength) {
        matrix.push(row);
        row = [];
      }
      row.push(`${name}`);
    });
    if(row.length > 0) {
      matrix.push(row);
    }
    let formatted = this.terminal.format_grid(matrix, false);
    return this.terminal.print_grid(formatted, "   ");
  }
  run(commandObj) {
    commandObj.out = "\n" + this.printCommands() + "\n";
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
    this.info = `  Mnemonic:  HELP
  Full command:  HELP [command]

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
      out += this.commandsCommand.printCommands();
      // if invalid list the valid commands

    }
    out += "\n";
    commandObj.out = out;
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
  moveTo(sector) {
    // how do they do collisions ?
    // check path for objects
    this.player.warpTo(sector);
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
  manual(deltaQy, deltaQx, deltaSy, deltaSx) {
    // calculate the destination
    let destination = this.player.mover.calculateDestination(deltaQy, deltaQx, deltaSy, deltaSx);
    this.moveTo(destination);
  }
  // automatic mode
  automatic(quadY, quadX, sectorY, sectorX) {
    // get sector
    let sector = this.galaxy.getSector(quadX, quadY, sectorX, sectorY);
    this.moveTo(sector);
  }
  run(commandObj) {
    // modes : manual and automatic
    let manual = true;
    let automatic = false;
    let manualOption = optionRegexifier("m", "manual");
    let automaticOption = optionRegexifier("a", "automatic");

    // remove mode option from arguments, if provided
    let args = commandObj.arguments;
    if(args.some(arg => manualOption.test(arg))) {
      manual = true;
      automatic = false;
      // remove matching arg
      args = args.filter(arg => !manualOption.test(arg))
    }
    if(args.some(arg => automaticOption.test(arg))) {
      manual = false;
      automatic = true;
      // remove matching arg
      args = args.filter(arg => !automaticOption.test(arg))
    }

    if(manual) {
      console.log("manual mode");
      // parse args, only two arguments
      if(args.length !== 2) {
        throw new Error("need y and x");
      }
      let [argY, argX] = args;
      // quadrant based args <deltaX> <deltaY>
      // fuck that I'm making them <deltaY> <deltaX> so that they're consistent
      let deltaQx = Math.trunc(argX);
      let deltaQy = Math.trunc(argY);
      let deltaSx = Math.trunc((argX * 10) % 10);
      let deltaSy = Math.trunc((argY * 10) % 10);
      // todo:: check bounds
      this.manual(deltaQy, deltaQx, deltaSy, deltaSx);
    } else if(automatic) {
      console.log("automatic mode");
      // parse args <quadY> <quadX> <sectorY> <sectorX>
      // or just <sectorY> <sectorX>
      // todo:: check bounds
      args = args.map(str => Number.parseInt(str));
      // make sure to convert from the 1 based commands
      // to the 0 based coordinates
      if(args.length === 4) {
        this.automatic(args[0] - 1, args[1] - 1, args[2] - 1, args[3] - 1);
      } else if (args.length === 2) {
        let quadrant = this.player.gameObject.quadrant;
        this.automatic(quadrant.y, quadrant.x, args[0] - 1, args[1] - 1);
      }

    }
    return commandObj;
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
  constructor(game, terminal, player) {
    super();
    this.terminal = terminal;
    this.game = game;
    this.player = player;
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
    let q = this.player.gameObject.quadrant;
    output += `\n\nEnterprise is currently in Quadrant ${q.y + 1} - ${q.x + 1}\n\n`;
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
