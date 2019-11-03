/**
 *
 */
class Terminal {
    constructor(takesInput = true) {
        this.$el = null;
        this.$terminal = null;
        this._out = "";
        this.silent = false;
        this._command = null;
        this._input = null;
        this._argumentStr = null;
        this._arguments = null;
        this.questionMode = false;
        this.question = "";
        this.commands = [];
        window.terminal = this;
        this.paging = true;
        this.takesInput = takesInput;
    }

    hideInput() {
        this.$el.find(".prompt").hide();
    }

    init($terminal, theme) {
        this.$el = $terminal;
        this.$terminal = this.$el.Ptty({
            ps: "",
            autocomplete: true,
            // native_css: false,
            theme: theme,
            i18n: {
                welcome: "-SUPER- STAR TREK\n\n",
                error_not_found: "Command not recognized, try 'help'.",
                error_bad_methdo: "Command malformed. Try 'help'."
            }
        });
        if(!this.takesInput) {
            this.hideInput();
        }
    }

    setPrompt(ps) {
        this.$terminal.change_settings({ps});
        this.$terminal.run_command();
        // clear fake command
        this.$el.find(".content > div").last().remove();
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

    clearAll() {
        this.$el.find(".content").empty();
        this._out = "";
    }

    /**
     * Print my output
     */
    print() {
        if(this.silent) return;
        if(!this._out) return;
        this.$terminal.echo(this._out);
        this._out = "";
    }


    // register all our commands with our terminal,
    // all commands get pass to runCommand with the command name
    // and the terminal's commandObj, we add a few things onto that object
    // note : we return the result of runCommand in case it wants to
    // modify the output
    registerCommand(command) {
        // check that we don't already have the command
        let has = this.commands.find(c => command.name === c.name);
        if(has) return;
        this.commands.push(command);
        this.$terminal.register("command", {
            name: command.name,
            method:  commandObj => this.runCommand(command.name, commandObj),
            regex: command.regex
        });
    }

    unregisterCommand(command) {
        let idx = this.commands.findIndex(c => command.name === c.name);
        if(idx === -1) return;
        this.commands.splice(idx, 1);
        this.$terminal.unregister("command", command.name);
    }

    parseCommand(commandObj, command) {
        let input = this.$terminal.get_input();
        let args = input.replace(command.regex, "");    // remove the command from the arguments
        this._command = command;
        this._input = input; // original input
        this._argumentStr = args;    //string arguments
        this._arguments = args.split(/\s/).filter(str => str.length > 0);    //array of args
    }

    getArguments() {
        return this._arguments;
    }

    hasOption(regex) {
        return regex.test(this._argumentStr);
    }

    // the only hitch here is question mode
    // in question mode we have the
    async runCommand(commandName, commandObj) {
        // find a command by name
        let command = this.commands.find(c => c.name === commandName);
        if (!command) {
            commandObj.out = "Not recognized.";
            return commandObj;
        }

        // get input parsing arguments
        this.parseCommand(commandObj, command);
        try {
            this.resolveUserCommand({command});
        } catch(e) {
            console.error(e);
            this.printLine("OOOF, that went really wrong. Try that again.");
            this.print();
        }
    }

    runUserCommand() {
        return new Promise((resolve, reject) => {
            this.resolveUserCommand = resolve;
        });
    }

    /**
     * Ask a question, returns resolved user input
     * @param question
     * @returns {Promise<void>}
     */
    async ask(question) {
        // print existing stuff ?
        this.print();
        // this.questionMode = true;
        // this.question = question;
        let oldPrompt = this.$terminal.get_settings().ps;
        this.setPrompt(question);
        return new Promise((resolve, reject) => {
            this.answer = (commandObj) => {
                let userInput = this.$terminal.get_input();
                this.$terminal.unregister('command','answer');
                this.$terminal.change_settings({ps: oldPrompt});
                this.$terminal.set_command_option({next: null});
                resolve(userInput);
                return commandObj;
            };
            this.$terminal.register('command', {
                name: "answer",
                method: this.answer.bind(this),
                regex: /answer/
            });
            this.$terminal.set_command_option({next: 'answer'});
        })
    }

    /**
     *
     * Specify a column width or defaults to the largest
     * @param grid array<array<string>>
     * @param padLeft bool add padding to left (true), add padding to right (false)
     * @param columnWidth int
     * @param individualWidths bool (set the column widths individually or use the widest column)
     * @returns array<array<string>>
     */
    formatGrid(grid, padLeft = true, columnWidth = null, individualWidths = false) {
        if(!individualWidths) {
            if (columnWidth === null) {
                // get longest string that we'll use for data
                var longest = grid.reduce((l, row) => {
                    var l2 = row.reduce((carry, d) => {
                        return carry > d.length ? carry : d.length;
                    }, 0);
                    return l > l2 ? l : l2;
                }, 0);
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
        } else {
            let widths = [];
            grid.forEach(row => {
                row.forEach((str, i) => {
                    if(!widths[i]) {
                        widths[i] = str.length;
                        return;
                    }
                    let prev = widths[i];
                    if(str.length > prev) {
                        widths[i] = str.length;
                    }
                })
            });
            return grid.map(row => {
                return row.map((str, i) => {
                    if (padLeft) {
                        return str.padStart(widths[i])
                    } else {
                        return str.padEnd(widths[i]);
                    }
                });
            });
        }
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
export const pane1 = new Terminal(false);
export const pane2 = new Terminal(false);