import {GameObject, Collider} from "../Components.js";
import {terminal} from '../Terminal.js';
import AI from '../AI.js';
import {Phasers, PhotonTorpedoLauncher, Shields} from "../Devices.js";

export class AbstractEnemy {
    constructor(galaxy, player, game) {
        this.energy = 200;
        this.galaxy = galaxy;
        this.player = player;
        this.game = game;
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 80, 80);
        this.phasers = new Phasers(this);
        this.photons = new PhotonTorpedoLauncher(this);
        this.ai = new AI(this, galaxy, player);
        this.terminal = terminal;
        this.name = this.constructor.name;
    }

    die() {
        this.terminal.printLine(`${this.name} at ${this.gameObject.getSectorLocation()} was destroyed.`);
        console.log("You killed ", this);
        this.gameObject.removeSelf();
        this.game.killEnemy(this);
    }
}

export class AbstractKlingon extends AbstractEnemy {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
    }
}

export class Klingon extends AbstractKlingon {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 40;
        this.energy = 400;
    }
}

export class KlingonCommander extends AbstractKlingon {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 100;
        this.energy = 1200;
    }
}

export class KlingonSuperCommander extends AbstractKlingon {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 400;
        this.energy = 1750;
    }
}

export class Romulan extends AbstractEnemy {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 40;
        this.energy = 700;
    }
}
