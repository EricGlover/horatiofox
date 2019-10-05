// command structure
// abbreviation (alias for command entry)
// name (command name used for entry )
// helpName (the title of the help file)
// device used
// full name (the full name of the command)
// options ?

class Command {
  formatGrid() {}
  concatGrid() {}
  run(commandObj) {

  }
}

class RequestCommand {
  constructor(game, terminal) {
    this.terminal = terminal;
    this.game = game;
    this.name = "request";
    this.abbreviation = "req";
    this.regex = regexifier("req", "request", "request information");
    this.fullName = "request information";
    this.deviceUsed = "";
    this.options = {};
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

    debugger;
    // ask
    if(commandObj.arguments.length === 0) {
      commandObj.ps = "Information desired? ";
      commandObj.next = "Information desired? %cmd%";
      return commandObj;
      // this.game.terminal.change_settings({ps: ""});
      // this.terminal.prompt("Information desired?", this.requestInfo.bind(this));
      // return;
    }

    let status = this.getStatusText();
    let date = regexifier('date', "d");
    let condition = regexifier("condition", "c");
    let position = regexifier("position", "p");
    let lifeSupport = regexifier("lsupport", "l");
    let warpFactor = regexifier("warpfactor", "w");
    let energy = regexifier("energy", "e");
    let torpedoes = regexifier("torpedoes", "t");
    let shields = regexifier("shields", "s");
    let klingonsRemaining = regexifier("klingons", "s");
    let timeLeft = regexifier("time", "ti");
    let request = "";
    if(date.test(request)) {
      return status[0];
    } else if (condition.test(request)) {
      return status[1];
    } else if (position.test(request)) {
      return status[2];
    } else if (lifeSupport.test(request)) {
      return status[3];
    } else if (warpFactor.test(request)) {
      return status[4];
    } else if (energy.test(request)) {
      return status[5];
    } else if (torpedoes.test(request)) {
      return status[6];
    } else if (shields.test(request)) {
      return status[7];
    } else if (klingonsRemaining.test(request)) {
      return status[8];
    } else if (timeLeft.test(request)) {
      return status[9];
    }
  }
}
// exact matcher
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
// todo:: consider breaking these up into separate command classes
export const commands = [
  {
    abbreviation: "req",
    name: "request",
    regex: regexifier("req", "request", "request information"),
    fullName: "request information",
    devicedUsed: "",
    options: {},
    info: `Mnemonic:  REQUEST
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
 TIME LEFT             TIME                                TI`
  },
  {
    abbreviation: 'st',
    name: 'status',
    regex: regexifier("st", "status", "status report"),
    fullName: 'status report',
    deviceUsed: '',
    options: {},
    info: `Mnemonic:  STATUS
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
See REQUEST command for details.`
  },
  {
    abbreviation: "c",
    name: "chart",
    regex: regexifier("c", "chart", "star chart"),
    fullName: "star chart",
    devicedUsed: "",
    options: {},
    info: `As you proceed in the game, you learn more and more about what things
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
    nor energy, and can be done safely whether in or out of battle.`
  },
  {
    abbreviation: "s",
    name: "srscan",
    regex: regexifier("s", "srscan", "short range scan"),
    fullName: "short range scan",
    deviceUsed: "",
    options: {
      no: {
        abbreviation: "n",
        description: "don't display status information"
      },
      chart: {
        abbreviation: "c",
        description: "display star chart"
      }
    },
    info: `Mnemonic:  SRSCAN
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
    the contents of adjacent sectors.`
  },
  {
    abbreviation: "l",
    name: "lrscan",
    regex: regexifier("l", "lrscan", "long range scan"),
    fullName: "Long Range Scan",
    devicedUsed: "",
    options: {},
    info: `  Mnemonic:  LRSCAN
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
    done safely regardless of battle conditions.`
  }
];

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
