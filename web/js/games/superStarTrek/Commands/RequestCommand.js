import {Command, regexifier, optionRegexifier, INFO_COMMAND} from "./Command.js";

export class RequestCommand extends Command {
    constructor(game, terminal, statusCommand) {
        super('req', 'request', 'request info', INFO_COMMAND);
        this.terminal = terminal;
        this.game = game;
        this.statusCommand = statusCommand;
        this.arguments = 1;
        this._info = `
Full command:  REQUEST [ITEM]

This command allows you to get any single piece of information from
the [STATUS] command.  [ITEM] specifies which information as follows:

 INFORMATION       NAME OF [ITEM]           SHORTEST ABBREVIATION

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

    async run() {
        let request = this.terminal.getArguments()[0];
        // ask
        if (!request) {
            request = await this.terminal.ask("Information desired? ");
        }

        // otherwise
        let status = this.statusCommand.getStatusText();
        let date = optionRegexifier('date', "d");
        let condition = optionRegexifier("condition", "c");
        let position = optionRegexifier("position", "p");
        let lifeSupport = optionRegexifier("lsupport", "l");
        let warpFactor = optionRegexifier("warpfactor", "w");
        let energy = optionRegexifier("energy", "e");
        let hullIntegrity = optionRegexifier("hull", "health", "h");
        let torpedoes = optionRegexifier("torpedoes", "t");
        let shields = optionRegexifier("shields", "s");
        let klingonsRemaining = optionRegexifier("klingons", "s");
        let timeLeft = optionRegexifier("time", "ti");

        let output;
        if (date.test(request)) {
            output = status[0];
        } else if (condition.test(request)) {
            output = status[1];
        } else if (position.test(request)) {
            output = status[2];
        } else if (lifeSupport.test(request)) {
            output = status[3];
        } else if (warpFactor.test(request)) {
            output = status[4];
        } else if (energy.test(request)) {
            output = status[5];
        } else if (hullIntegrity.test(request)) {
            output = status[6];
        } else if (torpedoes.test(request)) {
            output = status[7];
        } else if (shields.test(request)) {
            output = status[8];
        } else if (klingonsRemaining.test(request)) {
            output = status[9];
        } else if (timeLeft.test(request)) {
            output = status[10];
        } else {
            output = "UNRECOGNIZED REQUEST. Legal requests are:\n" +
                "  date, condition, position, lsupport, warpfactor,\n" +
                "  energy, torpedoes, shields, klingons, time.\n"
        }
        this.terminal.echo(output);
    }
}