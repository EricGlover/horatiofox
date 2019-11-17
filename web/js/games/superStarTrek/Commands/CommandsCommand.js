import {Command, regexifier, INFO_COMMAND} from "./Command.js";

export class CommandsCommand extends Command {
    constructor(game, terminal) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.name = "commands";
        this.regex = regexifier("commands");
        this.type = INFO_COMMAND;
        this.info = `
 ABBREV    FULL COMMAND                             DEVICE USED
 ------    ------------                             -----------
 C         CHART                                    (none)
 D         DOCK                                     (none)
 L         LRSCAN                                   long-range sensors
 M         MOVE [MANUAL] [DISPLACEMENT]             warp engines
           MOVE AUTOMATIC [DESTINATION]             warp engines and computer
 P         PHASERS [TOTAL AMOUNT]                   phasers and computer
           PHASERS AUTOMATIC [TOTAL AMOUNT]         phasers, computer, sr sensors
           PHASERS MANUAL [AMT1] [AMT2] ...         phasers
 PHO       PHOTONS [NUMBER] [TARGETS]               torpedo tubes 
 REP       REPORT                                   (none)
 REQ       REQUEST                                  (none)
 S         SRSCAN [NO or CHART]                     short-range sensors
 SH        SHIELDS [UP, DOWN, or TRANSFER]          deflector shields
 ST        STATUS                                   (none)

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
    units may be fired in a single burst without danger of overheat.`
    }

    printCommands() {
        let matrix = [];
        let row = [];
        let rowLength = 4;
        this.game.commands.map(c => c.name).sort().forEach(name => {
            // make a new row
            if (row.length === rowLength) {
                matrix.push(row);
                row = [];
            }
            row.push(`${name}`);
        });
        if (row.length > 0) {
            matrix.push(row);
        }
        let formatted = this.terminal.formatGrid(matrix, false);
        return this.terminal.printGrid(formatted, "   ");
    }

    run() {
        this.terminal.newLine();
        this.terminal.echo(this.printCommands());
    }
}