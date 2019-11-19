import {Command, regexifier, INSTANT_SHIP_COMMAND} from "./Command.js";

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

    run() {
        let warpFactor = Number.parseFloat(this.terminal.getArguments()[0]);
        if (Number.isNaN(warpFactor)) {
            this.terminal.printLine("Beg your pardon, Captain?");
            return;
        }
        if (warpFactor < 1.0) {
            this.terminal.printLine(`Helmsman Sulu- "We can't go below warp 1, Captain."`);
        } else if (warpFactor <= 6.0) {
            this.terminal.printLine(`Helmsman Sulu- "Warp factor ${warpFactor.toFixed(1)}, Captain."`);
        } else if (warpFactor < 8.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, but our maximum safe speed is warp 6."`);
        } else if (warpFactor >= 8.0 && warpFactor < 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, but our engines may not take it."`);
        } else if (warpFactor === 10.0) {
            this.terminal.printLine(`Engineer Scott- "Aye, Captain, we'll try it."`);
        } else if (warpFactor > 10.0) {
            this.terminal.printLine(`Helmsman Sulu- "Our top speed is warp 10, Captain."`);
        } else {
            this.terminal.printLine("Beg your pardon, Captain?");
            return;
        }
        this.player.warpEngines.warpFactor = warpFactor;
    }
}