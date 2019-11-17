import {Command,regexifier, INFO_COMMAND} from "./Command.js";

export class GetHelpCommand extends Command {
    constructor(game, terminal, commandsCommand) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.commandsCommand = commandsCommand;
        this.abbreviation = "help";
        this.name = "help";
        this.regex = regexifier("help");
        this.fullName = "ask for help";
        this.type = INFO_COMMAND;
        this.info = `  Mnemonic:  HELP
  Full command:  HELP [command]

This command reads the appropriate section from the SST.DOC file,
providing the file is in the current directory.`;
    }

    async run() {
        this.terminal.newLine();
        let arg = this.terminal.getArguments()[0];
        // prompt
        if (!arg) {
            do {
                arg = await this.terminal.ask("Help on what command?");
            } while (!arg);
        }

        // get the relevant command by name
        let command = this.game.commands.find(c => c.regex.test(arg));
        if (command) {
            this.terminal.echo(`Spock- "Captain, I've found the following information:"\n`);
            // todo:: implement the page scrolling stuff
            this.terminal.echo(command.info);
        } else {
            this.terminal.echo("Valid Commands:\n");
            this.terminal.echo(this.commandsCommand.printCommands());
            // if invalid list the valid commands

        }
        this.terminal.newLine();
    }
}