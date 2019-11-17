import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {AbstractKlingon, Klingon, KlingonCommander, KlingonSuperCommander} from "../Enemies/Enemies.js";
import StarBase from "../Objects/StarBase.js";

export class ReportCommand extends Command {
    constructor(game, terminal, galaxy, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.galaxy = galaxy;
        this.abbreviation = "rep";
        this.name = "report";
        this.regex = regexifier(this.abbreviation, this.name);
        this.type = INFO_COMMAND;
        this.info = `
    Mnemonic:  REPORT
    Shortest abbreviation: REP

This command supplies you with information about the state of the
current game.  Its purpose is to remind you of things that you have
learned during play, but may have forgotten, and cannot otherwise
retrieve if you are not playing at a hard-copy terminal.

     You are told the following things:

       . The length and skill level of the game you are playing
       . The original number of Klingons
       . How many Klingons you have destroyed
       . Whether the Super-Commander has been destroyed
       . How many bases have been destroyed
       . How many bases are left
       . What bases (if any) are under attack; your subspace radio
         must have been working since the attack to get this 
         information.
       . How many casualties you have suffered
       . How many times you have called for help.

This same information is automatically given to you when you start to
play a frozen game.`
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