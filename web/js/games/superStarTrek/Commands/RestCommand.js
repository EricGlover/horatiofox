import {Command, regexifier, TIME_EXPENDING_SHIP_COMMAND} from "./Command.js";

export class RestCommand extends Command {
    constructor(game, terminal) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.name = "rest";
        this.regex = regexifier(this.name);
        this.type = TIME_EXPENDING_SHIP_COMMAND;
        this.info = `
  Mnemonic:  REST
  Shortest abbreviation:  R
  Full command:  REST <NUMBER OF STARDATES>

This command simply allows the specified number of stardates to go
by.  This is useful if you have suffered damages and wish to wait
until repairs are made before you go back into battle.

It is not generally advisable to rest while you are under attack by
Klingons.
        `
    }

    run() {
        let days = Number.parseFloat(this.terminal.getArguments());
        this.game.clock.elapseTime(days);
    }
}