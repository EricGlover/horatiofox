import {Command, INSTANT_SHIP_COMMAND} from "./Command.js";

export class WarpFactorCommand extends Command {
    constructor(terminal, player) {
        super('w', 'warp', 'warp factor', INSTANT_SHIP_COMMAND);
        this.terminal = terminal;
        this.player = player;
        this._info = `
Syntax:  WARP [number]

Your warp factor controls the speed of your starship.  The larger the
warp factor, the faster you go and the more energy you use.

Your minimum warp factor is 1.0 and your maximum warp factor is 10.0
(which is 100 times as fast and uses 1000 times as much energy).  At
speeds above warp 6 there is some danger of causing damage to your
warp engines; this damage is larger at higher warp factors and also
depends on how far you go at that warp factor.`
    }

    async runInteractive() {
        let response;
        let valid = false;
        do {
            response = await terminal.ask("What should we set our warp factor to?");
            response = Number.parseFloat(response);
            if(Number.isNaN(response)) {
                this.thusSayethHelmsmanSulu();
            } else if (response < 1.0 || response > 10.0) {
                this.thusSayethHelmsmanSulu();
            } else {
                valid = true;
            }
        } while (!valid);
        return response;
    }

    thusSayethHelmsmanSulu() {
        this.terminal.printLine(`Helmsman Sulu- "We can only set warp factor between 1 - 10, Captain."`);
    }

    async run() {
        let args = this.terminal.getArguments();
        let warpFactor;
        if(args.length === 0) {
            warpFactor = await this.runInteractive();
        } else {
            warpFactor = Number.parseFloat(args[0]);
            // if invalid then do interactive mode
            if (Number.isNaN(warpFactor)) {
                this.thusSayethHelmsmanSulu();
                warpFactor = await this.runInteractive();
            } else if (warpFactor < 1.0) {
                this.thusSayethHelmsmanSulu();
                warpFactor = await this.runInteractive();
            } else if (warpFactor > 10.0) {
                this.thusSayethHelmsmanSulu();
                warpFactor = await this.runInteractive();
            }
        }

        if (warpFactor <= 6.0) {
            this.terminal.printLine(`Helmsman Sulu- "Warp factor ${warpFactor.toFixed(1)}, Captain."`);
        } else if (warpFactor < 8.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, but our maximum safe speed is warp 6."`);
        } else if (warpFactor >= 8.0 && warpFactor < 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, but our engines may not take it."`);
        } else if (warpFactor === 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, we'll try it."`);
        }

        this.player.warpEngines.warpFactor = warpFactor;
    }
}