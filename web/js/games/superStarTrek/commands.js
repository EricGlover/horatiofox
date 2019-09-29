// command structure
// abbreviation (alias for command entry)
// name (command name used for entry )
// helpName (the title of the help file)
// device used
// full name (the full name of the command)
// options ?
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
export const commands = [
  {
    abbreviation: "ABANDON",
    name: "ABANDON",
    deviceUsed: "shuttle craft",
    fullName: "abandon"
  },
  {
    abbreviation: "s",
    name: "srscan",
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
    regex: /^\s*(l|lrscan)\s*$/i,
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
  },
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
