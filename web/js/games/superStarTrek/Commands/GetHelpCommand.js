import {Command,regexifier, INFO_COMMAND} from "./Command.js";

export class GetHelpCommand extends Command {
    constructor(game, terminal, commandsCommand) {
        super('help', 'help', 'ask for help', INFO_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.commandsCommand = commandsCommand;
        this.regex = regexifier("help");
        this.type = INFO_COMMAND;
        this._info = `
Syntax:  HELP [command]

To get information about a command, just type help and the command name.
If the command has modes, options, or other arguments that you need to provide 
you can find all that info in the help information for the command.
To get a list of commands try the "commands" command.

Info about commands:
To run the command you can type the command's abbreviation, name or full name.
Some commands have modes and these modes are the first argument you provide.
Some commands have options which can be provided anyway in the command.
`;
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