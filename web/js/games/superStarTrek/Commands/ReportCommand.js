import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {AbstractKlingon, Klingon, KlingonCommander, KlingonSuperCommander} from "../Enemies/Enemies.js";
import StarBase from "../Objects/StarBase.js";

export class ReportCommand extends Command {
    constructor(game, terminal, galaxy) {
        super('repo', 'report', 'game report', INFO_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.galaxy = galaxy;
        this._info = `
This command supplies you with information about the state of the
current game.  Its purpose is to remind you of things that you have
learned during play, but may have forgotten.

     You are told the following things:

       . The length and skill level of the game you are playing
       . The original number of Klingons
       . How many Klingons you have destroyed
       . Whether the Super-Commander has been destroyed
       . How many bases have been destroyed
       . How many bases are left`
    }

    run() {
        this.terminal.printLine(`You are now playing a ${this.game.getGameLengthStr()} ${this.game.getDifficultyStr()} game.`);
        let killedKlingonsAll = this.game.getNumberOfTypeKilled(AbstractKlingon);
        let killedKlingons = this.game.getNumberOfTypeKilled(Klingon);
        let killedCommanders = this.game.getNumberOfTypeKilled(KlingonCommander);
        let killedSuperCommanders = this.game.getNumberOfTypeKilled(KlingonSuperCommander);

        this.terminal.printLine(`${killedKlingonsAll} of ${this.game.initialEnemies} klingons have been killed.`);
        this.terminal.printLine(`${killedKlingons} klingon warbirds killed.`);
        this.terminal.printLine(`${killedCommanders} klingon commanders killed.`);
        this.terminal.printLine(`${killedSuperCommanders} klingon super commanders killed.`);

        // remaining bases
        let remainingBases = this.galaxy.container.getCountOfGameObjects(StarBase);
        this.terminal.printLine(`There are ${remainingBases} remaining bases.`);
        // todo:: bases destroyed, bases under attack, casualties, times called for help
    }
}