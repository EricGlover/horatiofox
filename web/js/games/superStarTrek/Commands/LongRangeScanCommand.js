import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {StarChart} from "../Space/StarChart.js";

export class LongRangeScanCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super('l', 'lrscan', 'long range scan', INFO_COMMAND);
        this.terminal = terminal;
        this.game = game;
        this.player = player;
        this.galaxy = galaxy;
        this._info = `
A long-range scan gives you general information about where you are
and what is around you.  Here is an example output.

    Long-range scan for Quadrant 1 - 5
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
    -1 :              Outside of galaxy

For example, in your quadrant (1 - 5) the number is 316, which
indicates 3 Klingons, 1 starbase, and 6 stars.  The long-range
scanner does not distinguish between ordinary Klingons and Klingon
command ships.  If there is a supernova, as in the quadrant below and
to your right (quadrant 2 - 6), there is nothing else in the
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

    get info() {
      return this.makeInfo() + "\n"  + this._info;
    }

    run() {
        if (!this.player.longRangeSensors || this.player.longRangeSensors.isDamaged()) {
            this.terminal.printLine(`Spock - Long Range Sensors are damaged, Captain.`);
            return;
        }
        if (!this.player.starChart || !(this.player.starChart instanceof StarChart)) {
            this.terminal.printLine(`Spock - This is embarrassing but I've misplaced the Star Chart Captain.`);
            return;
        }

        // use player location
        let playerQuadrant = this.player.gameObject.quadrant;
        // get a 3 x 3 quadrant matrix with the player at the center
        let matrix = [];

        // update star chart with the new info
        let adjacentQuadrants = this.galaxy.getQuadrantsAdjacencyMatrix(playerQuadrant);
        this.player.starChart.longRangeScan(adjacentQuadrants.flat().filter(q => q));

        // look at surronding quadrants, get the corresponding info from the chart
        for (let i = 0; i < adjacentQuadrants.length; i++) {
            let row = adjacentQuadrants[i];
            let textRow = [];
            for (let j = 0; j < row.length; j++) {
                let quadrant = row[j];
                if (!quadrant) {
                    textRow.push('-1');
                    continue;
                }
                try {
                    let info = this.player.starChart.getInfo(quadrant);
                    textRow.push(info.print());
                } catch (e) {
                    textRow.push(`-1`); //out of bounds
                }
            }
            matrix.push(textRow);
        }

        this.terminal.printLine('Digits: Thousands = # supernova; Hundreds = # klingon; Tens = # star bases; ones = # stars.');
        this.terminal.printLine(`Long-range scan for ${this.player.gameObject.printQuadrantLocation()}`);
        this.terminal.skipLine(1);
        this.terminal.printLine(this.terminal.joinGrid(this.terminal.formatGrid(matrix), "    "));
    }
}