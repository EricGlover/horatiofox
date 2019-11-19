import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {AbstractKlingon} from "../Enemies/Enemies.js";
import StarBase from "../Objects/StarBase.js";
import Star from "../Objects/Star.js";

export class ChartCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super("c", "chart", "star chart", INFO_COMMAND);
        this.terminal = terminal;
        this.game = game;
        this.player = player;
        this.galaxy = galaxy;
        this.regex = regexifier("c", "chart", "star chart");
        this.addPadding = false;
        this.showAll = false;
        this._info = `
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
        for (let i = 0; i < this.galaxy.length; i++) {
            let row = this.galaxy.getRow(i);
            let textRow = [];
            // convert each quadrant to text
            row.forEach(quadrant => {
                if (this.showAll) {
                    let superNovaText = quadrant.hasSupernova ? "1" : ".";
                    let klingonText = quadrant.container.getCountOfGameObjects(
                        AbstractKlingon
                    );
                    let starbaseText = quadrant.container.getCountOfGameObjects(StarBase);
                    let starText = quadrant.container.getCountOfGameObjects(Star);
                    let text = `${superNovaText}${klingonText}${starbaseText}${starText}`;
                    textRow.push(text);
                }
                // get info from chart
                try {
                    let info = this.player.starChart.getInfo(quadrant);
                    textRow.push(info.print());
                } catch (e) {
                    textRow.push(`-1`); //out of bounds
                }
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

        return this.terminal.formatGrid(grid).map(row => row.join("  ")).join("\n");
    }

    run() {
        if (this.addPadding) this.terminal.newLine();
        this.terminal.echo("STAR CHART FOR THE KNOWN GALAXY");
        if (this.addPadding) this.terminal.newLine();
        this.terminal.newLine();
        this.terminal.printLine(this.makeChartText());
        this.terminal.printLine();
        this.terminal.printLine(`thousands digit:   supernova
hundreds digit:    Klingons
tens digit:        starbases
ones digit:        stars
period (.):        digit not known`);
        this.terminal.printLine();
        let q = this.player.gameObject.quadrant;
        this.terminal.printLine(`Enterprise is currently in ${this.player.gameObject.printQuadrantLocation()}`);
        if (this.addPadding) this.terminal.newLine();
    }
}