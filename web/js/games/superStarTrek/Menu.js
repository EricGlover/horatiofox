// starting a game
// choose mode
// if regular
// choose length
// choose difficulty
// choose secret password
// if tournament
// choose tournament #
// choose length
// choose difficulty
// choose secret password
// start
// if frozen
// choose file name
// if not found start menu again
export default class Menu {
    constructor(terminal, startGame) {
        this.mode = null;
        this.length = null;
        this.difficulty = null;
        this.secretPassword = null;
        this.terminal = terminal;
        this.startGame = startGame;
        this.startGamePs = "COMMAND>";
    }

    skipLine(n) {
        var str = "";
        for (let i = 0; i < n; i++) {
            str += "\n";
        }
        this.terminal.$terminal.echo(str);
    }

    start() {
        this.mode = null;
        this.length = null;
        this.difficulty = null;
        this.secretPassword = null;
        this.skipLine(2);
        // tag line
        this.terminal.$terminal.echo("Latest update-21 Sept 78");
        this.skipLine(1);
        // ask mode
        this.ask(
            "Would you like a regular, tournament, or frozen game?",
            ["regular", "tournament", "frozen"],
            this.chooseMode.bind(this)
        );
    }

    chooseMode(input) {
        input = input.toLowerCase();
        if (/regular/.test(input)) {
            this.mode = "regular";
            this.skipLine(1);
            this.ask(
                "Would you like a Short, Medium, or Long game? ",
                ["short", "medium", "long"],
                this.chooseLength.bind(this)
            );
        } else if (/tournament/.test(input)) {
            this.mode = "tournament";
            this.terminal.$terminal.echo("Sorry that's not implemented.");
            this.start();
        } else if (/frozen/.test(input)) {
            this.mode = "frozen";
            this.terminal.$terminal.echo("Sorry that's not implemented.");
            this.start();
        }
    }

    chooseLength(input) {
        input = input.toLowerCase();
        if (/short/.test(input)) {
            this.length = "short";
        } else if (/medium/.test(input)) {
            this.length = "medium";
        } else if (/long/.test(input)) {
            this.length = "long";
        }
        this.ask(
            "Are you a Novice, Fair, Good, Expert, or Emeritus player? ",
            ["novice", "fair", "good", "expert", "emeritus"],
            this.chooseDifficulty.bind(this)
        );
    }

    chooseDifficulty(input) {
        input = input.toLowerCase();
        if (/novice/.test(input)) {
            this.difficulty = "novice";
        } else if (/fair/.test(input)) {
            this.difficulty = "fair";
        } else if (/good/.test(input)) {
            this.difficulty = "good";
        } else if (/expert/.test(input)) {
            this.difficulty = "expert";
        } else if (/emeritus/.test(input)) {
            this.difficulty = "emeritus";
        } else {
            // hmmm ....
        }
        this.prompt(
            "Please type in a secret password (9 characters maximum)-",
            this.chooseSecretPassword.bind(this), this.startGamePs
        );
    }

    chooseSecretPassword(input) {
        this.secretPassword = input;
        this.finish();
    }

    finish() {
        this.terminal.$terminal.change_settings({ps: this.startGamePs});
        // start game now !!!!
        this.startGame();
    }

    /**
     *  register question
     // intercept response
     // unregister question
     // call method , pass input
     **/
    prompt(question, method, ps) {
        this.terminal.$terminal.echo(question);
        this.terminal.$terminal.register("command", {
            name: "ask",
            method: cmd => {
                let input = this.terminal.$terminal.get_input(); // save this
                this.terminal.$terminal.unregister("command", "ask");
                // delay a bit so our terminal can finish processing
                setTimeout(() => method(input), 10);
                if (ps) {
                    return {ps};
                }
            },
            regex: new RegExp(`[\s\S]*`, "i")
        });
    }

    /**
     *  register question
     // intercept response
     // unregister question
     // call method , pass input
     **/
    ask(question, options, method) {
        this.terminal.$terminal.echo(question);
        this.terminal.$terminal.register("command", {
            name: "ask",
            method: cmd => {
                let input = this.terminal.$terminal.get_input(); // save this
                this.terminal.$terminal.unregister("command", "ask");
                // delay a bit so our terminal can finish processing
                setTimeout(() => method(input), 10);
            },
            regex: new RegExp(`(${options.join("|")})`, "i")
        });
        // saving the input and then running a callback would be better but
        // my modifications broke the plugin
        // todo:: fix callbacks
        // $ptty.register("callback", {
        //   name: "ask",
        //   method: cmd => {
        //     console.log("done");
        //   }
        // });
    }
}