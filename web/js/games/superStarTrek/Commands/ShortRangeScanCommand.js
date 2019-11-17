import {Command, regexifier, optionRegexifier, INFO_COMMAND} from "./Command.js";
import {shortRangeSensorType} from "../Devices.js";
import {Klingon, KlingonCommander, KlingonSuperCommander, Romulan} from "../Enemies/Enemies.js";
import Enterprise from "../PlayerShips/Enterprise.js";
import Star from "../Objects/Star.js";
import Planet from "../Objects/Planet.js";
import StarBase from "../Objects/StarBase.js";
import BlackHole from "../Objects/BlackHole.js";

export class ShortRangeScanCommand extends Command {
    constructor(game, terminal, player, chartCommand, statusCommand) {
        super();
        this.terminal = terminal;
        this.game = game;
        this.player = player;
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
        this.deviceUsed = [shortRangeSensorType];
        this.addPadding = false;
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

    objectToText(obj) {
        if (!obj) {
            return '.';
        } else if (obj instanceof Klingon) {
            return 'K';
        } else if (obj instanceof KlingonCommander) {
            return "C";
        } else if (obj instanceof KlingonSuperCommander) {
            return "S";
        } else if (obj instanceof Romulan) {
            return "R";
        } else if (obj instanceof Enterprise) {
            return "E";
        } else if (obj instanceof Star) {
            return "*";
        } else if (obj instanceof Planet) {
            return "P";
        } else if (obj instanceof StarBase) {
            return "B";
        } else if (obj instanceof BlackHole) {
            return " ";
        }
        return "?";
    }

    async run() {
        // get their short range sensors
        let sensors = this.player.deviceContainer.getDevice(shortRangeSensorType);
        if (!sensors) {
            this.terminal.printLine("Captain we don't have sensors!");
            return;
        }
        // get the options
        let no = optionRegexifier("n", "no");
        let printStatus = !this.terminal.hasOption(no);
        let chart = optionRegexifier("c", "chart");
        let printChart = this.terminal.hasOption(chart);

        // use player location
        let quadrant = this.player.gameObject.quadrant;
        let matrix = [];

        // make our matrix of text
        // if damage set everything to -
        if (sensors.isDamaged()) {
            for (let i = 0; i < quadrant.sectors.length; i++) {
                let textRow = [];
                quadrant.sectors[i].forEach(sector => {
                    textRow.push('-')
                });
                matrix.push(textRow);
            }
            // now show the adjacent sectors
            let adjacent = this.player.gameObject.sector.getAdjacentSectors(true);
            adjacent.forEach(sector => {
                let obj = sector.container.getAllGameObjects()[0];
                matrix[sector.y][sector.x] = this.objectToText(obj);
            })
        } else {
            // update star chart
            this.player.starChart.shortRangeScan(quadrant);
            for (let i = 0; i < quadrant.sectors.length; i++) {
                let textRow = [];
                quadrant.sectors[i].forEach(sector => {
                    let obj = sector.container.getAllGameObjects()[0];
                    textRow.push(this.objectToText(obj));
                });
                matrix.push(textRow);
            }
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

        // format the grid so the spacing is correct
        matrix = this.terminal.formatGrid(matrix);

        if (this.addPadding) this.terminal.newLine();
        this.terminal.printLine("CHART OF THE CURRENT QUADRANT");
        this.terminal.newLine();
        // add status info
        if (printStatus) {
            // join the row together, add separators
            matrix = matrix.map(row => row.join(" "));
            // skip the header rows, then add the status text line by line
            let statusLines = this.statusCommand.getStatusText();
            statusLines.forEach((line, i) => {
                matrix[i] += "  " + line;
            });
            // join the rows with \n
            let text = matrix.join("\n");
            // print
            // this.terminal.echo(text);
            this.terminal.echo(text);
        } else {
            this.terminal.printGrid(this.terminal.formatGrid(matrix), " ", "", true);
        }
        // print out the star chart if requested
        if (printChart) {
            this.terminal.echo("\n\n");
            this.terminal.echo(this.chartCommand.makeChartText());
        }
        if (this.addPadding) this.terminal.newLine();
        this.terminal.newLine();
        this.terminal.printLine("E = Enterprise");
        this.terminal.printLine("K = klingon; C = commander; S = super commander; R = romulan;");
        this.terminal.printLine(". = nothing; * = star; empty = black hole.");
        this.terminal.printLine("p = planet; b = base;")
        if (this.addPadding) this.terminal.newLine();
    }
}