import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import StarBase from "../Objects/StarBase.js";

export class DockCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super('d', 'dock', 'dock at starbase');
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.abbreviation = "d";
        this.name = "dock";
        this.fullName = "dock at starbase";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.deviceUsed = "";
        this.options = {};
        this.type = INFO_COMMAND;
        this._info = `
You may dock your starship whenever you are in one of the eight
sector positions immediately adjacent to a starbase.  When you dock,
your starship is resupplied with energy, shield energy, and photon
torpedoes.`;
    }

    run() {
        if (this.player.docked) {
            this.terminal.echo("Already docked.");
            return;
        }
        // if you're in one of the eight adjacent sectors of a starbase
        // then "dock"
        let sector = this.player.gameObject.sector;
        let quadrant = this.player.gameObject.quadrant;

        let found = false;
        let adjacent = quadrant.getSectorsAdjacentTo(sector);
        for(let i = 0; i < adjacent.length; i++) {
            let sector = adjacent[i];
            let starbase = sector.container.getGameObjectsOfType(StarBase)[0];
            if (starbase) {
                found = true;
                this.player.dock(starbase);
                this.terminal.echo("Docked.");
                break;
            }
        }
        if (!found) {
            this.terminal.echo(`${this.player.name} is not adjacent to a starbase.`);
        }
    }
}