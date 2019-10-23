class Terminal {
    constructor() {
        this.$terminal = null;
        this._out = "";
        this.silent = true;
        this.questionMode = false;
        this.question = "";
        this.commands = [];
    }

    echo(str) {
        if(this.silent) return;
        this._out += str;
    }

    newLine() {
        if(this.silent) return;
        this._out += "\n";
    }

    printLine(str = '') {
        if(this.silent) return;
        this._out += str + "\n";
    }

    skipLine(n = 1) {
        if(this.silent) return;
        for(let i = 0; i < n; i++) {
            this._out += "\n";
        }
    }

    getOutput() {
        return this._out;
    }

    clear() {
        if(this.silent) return;
        this._out = "";
    }

    print() {
        if(this.silent) return;
        this.$terminal.echo(this._out);
        this._out = "";
    }


    // register all our commands with our terminal,
    // all commands get pass to runCommand with the command name
    // and the terminal's commandObj, we add a few things onto that object
    // note : we return the result of runCommand in case it wants to
    // modify the output
    registerCommand(command) {
        this.commands.push(command);
        this.$terminal.register("command", {
            name: command.name,
            method:  commandObj => this.runCommand(command.name, commandObj),
            regex: command.regex
        });
    }

    parseCommand(commandObj, command) {
        let input = this.$terminal.get_input();
        let args = input.replace(command.regex, "");
        commandObj.command = command;
        commandObj.input = input;
        commandObj.argumentStr = args;
        commandObj.arguments = args.split(/\s/).filter(str => str.length > 0);
    }

    // the only hitch here is question mode
    // in question mode we have the
    runCommand(commandName, commandObj) {
        // find a command by name
        let command = this.commands.find(c => c.name === commandName);
        if (!command) {
            commandObj.out = "Not recognized.";
            return commandObj;
        }

        // if there's no interactive questions we just run the command
        // then resolve the user command promise so the game loop can run
        // then print the output
        if(!command.canAskQuestions) {
            // get input parsing arguments
            this.parseCommand(commandObj, command);

            // this is how the sausage is made
            try {
                command.run(commandObj);
            } catch(e) {
                console.error(e);
                this.printLine("OOOF, that went really wrong. Try that again.");
                this.print();
            }
            this.resolveUserCommand({command, commandObj});

            commandObj.out = this.getOutput();
            this.clear();
            return commandObj;
        } else if(command.canAskQuestions) {
            // we do some generator functions to yield control back and forth
            let ret;
            if(this.questionMode) {
                // clear the previous question
                this.questionMode = false;
                this.question = "";
                // pass the user response to the command
                let input = this.$terminal.get_input();
                ret = this.iterator.next(input);
                if(ret.done) {
                    commandObj = ret.value;
                    this.iterator = null;
                }
            } else {
                // first run, do all the normal things
                // get input parsing arguments
                this.parseCommand(commandObj, command);
                this.iterator = command.run(commandObj);

                try {
                    ret = this.iterator.next(commandObj);
                } catch(e) {
                    console.error(e);
                    this.printLine("OOOF, that went really wrong. Try that again.");
                    this.print();
                }
            }

            // command is finished executing
            if(ret.done) {
                delete commandObj.next;
                delete commandObj.ps;
                this.resolveUserCommand({command, commandObj});
                commandObj.out = this.getOutput();
                this.clear();
                return commandObj;
            } else if(this.questionMode && !ret.done) { // we're asking the user a question
                // set next command to this and ps to our question
                commandObj.next = command.name;
                commandObj.ps = this.question;
            }
            return commandObj;
        }
    }

    runUserCommand() {
        return new Promise((resolve, reject) => {
            this.resolveUserCommand = resolve;
        });
    }

    ask(question) {
        this.questionMode = true;
        this.question = question;
    }
    answer() {
        this.questionResolution(this.$terminal.get_input());
    }

    /**
     *
     * Specify a column width or defaults to the largest
     * @param grid array<array<string>>
     * @param columnWidth int
     * @returns array<array<string>>
     */
    formatGrid(grid, padLeft = true, columnWidth = null) {
        // get longest string that we'll use for data
        var longest = grid.reduce((l, row) => {
            var l2 = row.reduce((carry, d) => {
                return carry > d.length ? carry : d.length;
            }, 0);
            return l > l2 ? l : l2;
        }, 0);
        if (columnWidth === null) {
            columnWidth = longest;
        }
        return grid.map(row => {
            return row.map(str => {
                if (padLeft) {
                    return str.padStart(columnWidth)
                } else {
                    return str.padEnd(columnWidth);
                }
            });
        });
    }

    /**
     * @param grid
     * @param columnSeparator
     * @param rowSeparator
     */
    printGrid(grid, columnSeparator = " ", rowSeparator = "\n", echo = false) {
        var rows = [];
        for (var i = 0; i < grid.length; i++) {
            // make line of text for row
            var row = grid[i];
            var line = row.join(columnSeparator);
            rows.push(line + "\n");
        }
        var text = rows.join(rowSeparator);
        if (echo) {
            this.$terminal.echo(text);
        }
        return text;
    };
}

export const terminal = new Terminal();