import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {AbstractKlingon, Klingon, KlingonCommander, KlingonSuperCommander, Romulan} from "../Enemies/Enemies.js";

export class ScoreCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "sc";
        this.name = "score";
        this.regex = regexifier(this.abbreviation, this.name);
        this.type = INFO_COMMAND;
        this.info = `
  Mnemonic:  SCORE
  Shortest abbreviation: SC

Shows what the score would be if the game were to end naturally at
this point. Since the game hasn't really ended and you lose points if
you quit, this is perhaps a meaningless command, but it gives you a
general idea of how well you are performing.
        `
    }

    run() {
        let score = 0;
        let killedKlingonsAll = this.game.getNumberOfTypeKilled(AbstractKlingon);
        let killedKlingons = this.game.getNumberOfTypeKilled(Klingon);
        let kScore = killedKlingons * 10;
        let killedCommanders = this.game.getNumberOfTypeKilled(KlingonCommander);
        let cScore = killedCommanders * 50;
        let killedSuperCommanders = this.game.getNumberOfTypeKilled(KlingonSuperCommander);
        let scScore = killedSuperCommanders * 200;
        let killedRomulans = this.game.getNumberOfTypeKilled(Romulan);
        let romulanScore = killedRomulans * 20;
        score += kScore + cScore + scScore + romulanScore;

        let timeElapsed = this.game.clock.getElapsedTime();
        if (timeElapsed === 0) timeElapsed = 1;
        let klingonsPerDate = killedKlingonsAll / timeElapsed;
        let kPerDateScore = klingonsPerDate * 500;
        score += kPerDateScore;

        let lineLength = 60;
        this.terminal.printLine('Your score --');
        // make these strings fixed length
        this.terminal.printLine(`${killedRomulans} Romulan ships destroyed`.padEnd(lineLength, ' ') + romulanScore);
        this.terminal.printLine(`${killedKlingons} Klingon war birds destroyed`.padEnd(lineLength, ' ') + kScore);
        this.terminal.printLine(`${killedCommanders} Klingon Commander ships destroyed`.padEnd(lineLength, ' ') + cScore);
        this.terminal.printLine(`${killedSuperCommanders} Klingon Super Commander ships destroyed`.padEnd(lineLength) + scScore);
        this.terminal.printLine(`${klingonsPerDate.toFixed(2)} Klingons per stardate`.padEnd(lineLength) + kPerDateScore.toFixed(2));
        // victory adds 100 * skill
        if (this.game.isVictory()) {
            let v = this.game.skill * 100;
            score += v;
            this.terminal.printLine(`Bonus for winning ${this.game.getDifficultyStr()} game `.padEnd(lineLength) + v);
        }
        if (this.player.isDead()) {
            let d = -200;
            score += d;
            this.terminal.printLine(`Penalty for getting yourself killed`.padEnd(lineLength) + d);
        }
        this.terminal.skipLine(2);
        this.terminal.printLine(`TOTAL SCORE`.padEnd(lineLength) + score.toFixed(0));
    }
}