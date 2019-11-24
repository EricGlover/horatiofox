import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {ATTACK_COMMAND, MOVE_COMMAND} from "./Command";

export class CommandsCommand extends Command {
    constructor(game, terminal) {
        super('com', 'commands', 'show commands');
        this.game = game;
        this.terminal = terminal;
        this.type = INFO_COMMAND;
        this.options.addOption('alias', 'a', 'alias');
        this._info = `
Prints a chart of the commands sorted by types. 
Adding the 'alias' option shows you a chart of all the commands, their names, and aliases. 
`
    }

    printAliases() {
        let infoMatrix = [
            ['Abbreviation', 'Name', 'Full Name'],
            ['============', '====', '=========']
        ];

        let commands = this.game.getActiveCommands().sort((a, b) => {
            if(a.name === b.name) return 0;
            return a.name < b.name ? -1 : 1;
        });
        commands.forEach(c => {
            infoMatrix.push([c.abbreviation, c.name, c.fullName])
        });
        let formattted = this.terminal.formatGrid(infoMatrix, false, null, true);
        this.terminal.printLine(this.terminal.joinGrid(formattted, "    "));
    }

    getSortedCommands() {
        return this.game.getActiveCommands().sort((a, b) => {
            if(a.name === b.name) return 0;
            return a.name < b.name ? -1 : 1;
        });
    }

    printCommandsByType() {
        let moveCommands = [];
        let weaponCommands = [];
        let infoCommands = [];
        let otherCommands = [];
        this.getSortedCommands().forEach(c => {
            switch(c.type) {
                case ATTACK_COMMAND:
                    weaponCommands.push(c.name);
                    break;
                case INFO_COMMAND:
                    infoCommands.push(c.name);
                    break;
                case MOVE_COMMAND:
                    moveCommands.push(c.name);
                    break;
                default:
                    otherCommands.push(c.name);
            }
        });
        let matrix = [
            ['Move Commands', 'Weapon Commands'],
            ['=============', '==============='],
            [moveCommands.join(', '), weaponCommands.join(', ')],
            ['', ''],
            ['Info Commands', ''],
            ['=============', ''],
            [infoCommands.join(", "), ''],
            ['', ''],
            ['Other Commands', ''],
            ['==============', ''],
            [otherCommands.join(', '), '']
        ];
        let formatted = this.terminal.formatGrid(matrix, false, null, true);
        let txt = this.terminal.joinGrid(formatted, "   ");
        this.terminal.printLine(txt);
    }

    printCommands() {
        let matrix = [];
        let rowLength = 4;
        let names = this.getSortedCommands().map(c => c.name);
        let row = [];
        matrix.push(row);
        for(let i = 0; i < names.length; i++) {
            row.push('' + names[i]);
            if(row.length === rowLength) {
                row = [];
                matrix.push(row);
            }
        }
        let formatted = this.terminal.formatGrid(matrix, false);
        return this.terminal.joinGrid(formatted, "   ");
    }

    run() {
        let {alias} = this.options.parseOption(this.terminal.getArguments());
        if(alias) {
            this.printAliases();
        } else {
            this.printCommandsByType();
        }
        this.terminal.skipLine(1);
    }
}