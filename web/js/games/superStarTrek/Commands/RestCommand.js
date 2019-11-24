import {Command, TIME_EXPENDING_SHIP_COMMAND} from "./Command.js";

export class RestCommand extends Command {
    constructor(game, terminal) {
        super('r', 'rest', 'rest', TIME_EXPENDING_SHIP_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this._info = `
Full command:  REST [NUMBER OF STARDATES]

This command simply allows the specified number of stardates to go
by.  This is useful if you have suffered damages and wish to wait
until repairs are made before you go back into battle.

It is not generally advisable to rest while you are under attack by
Klingons.
        `
    }

    async run() {
        let args = this.terminal.getArguments();
        let runInteractive = args.length === 0;
        let days = Number.parseFloat(args[0]);
        if (Number.isNaN(days)) {
            runInteractive = true;
        } else if (days > this.game.timeRemaining) {
            this.terminal.printLine(`There's only ${this.game.timeRemaining} days left.`);
            let proceed = await this.getConfirmation(this.terminal,`Proceed?`);
            if (!proceed) {
                runInteractive = true;
            }
        } else if (days <= 0) {
            this.terminal.printLine("Beg pardon, Captain?");
            runInteractive = true;
        }

        if (runInteractive) {
            let response;
            let valid = false;
            do {
                response = await this.terminal.ask(`How many days would you like to rest? `);
                response = Number.parseFloat(response);
                if (Number.isNaN(response)) {
                    let cancel = await this.getConfirmation(this.terminal, `Cancel Command? `);
                    if (cancel) return;
                } else if (response <= 0) {
                    this.terminal.printLine("Beg pardon, Captain?");
                } else if (response > this.game.timeRemaining) {
                    this.terminal.printLine(`There's only ${this.game.timeRemaining} days left.`);
                    let proceed = await this.getConfirmation(this.terminal,`Proceed?`);
                    if (proceed) {
                        valid = true;
                        days = response;
                    }
                } else {
                    valid = true;
                    days = response;
                }
            } while (!valid);
        }
        this.game.clock.elapseTime(days);
    }
}