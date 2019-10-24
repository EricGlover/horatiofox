import {GameObject, Collider} from "../Components.js";
import {terminal} from '../Terminal.js';
import AI from '../AI.js';
import {PowerGrid, Phasers, PhotonTorpedoLauncher, LifeSupport, Shields} from "../Devices.js";
import {clock} from "../Game.js";

export class ShipBuilder {
    constructor() {
        this.kHealth  = 40;
        this.kEnergy  = 400;
        this.kcHealth = 100;
        this.kcEnergy = 1200;
        this.kscHealth = 400;
        this.kscEnergy = 1750;
        this.rHealth = 40;
        this.rEnergy = 700;
    }

    makeKlingon(galaxy, player, game, quadrant, sector) {
        let k = new Klingon(galaxy, player, game);
        k.collider.health = this.kHealth;
        k.powerGrid.energy = this.kEnergy;
        k.gameObject.placeIn(galaxy, quadrant, sector);
        return k;
    }

    makeKlingonCommander(galaxy, player, game, quadrant, sector) {
        let k = new KlingonCommander(galaxy, player, game);
        k.collider.health = this.kcHealth;
        k.powerGrid.energy = this.kcEnergy;
        k.gameObject.placeIn(galaxy, quadrant, sector);
        return k;
    }
    makeKlingonSuperCommander(galaxy, player, game, quadrant, sector) {
        let k = new KlingonSuperCommander(galaxy, player, game);
        k.collider.health = this.kscHealth;
        k.powerGrid.energy = this.kscEnergy;
        k.gameObject.placeIn(galaxy, quadrant, sector);
        return k;
    }
    makeRomulan(galaxy, player, game, quadrant, sector) {
        let k = new Romulan(galaxy, player, game);
        k.collider.health = this.rHealth;
        k.powerGrid.energy = this.rEnergy;
        k.gameObject.placeIn(galaxy, quadrant, sector);
        return k;
    }

}


export class AbstractEnemy {
    constructor(galaxy, player, game) {
        this.powerGrid = new PowerGrid(200, this);
        this.galaxy = galaxy;
        this.player = player;
        this.game = game;
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 80, 80);

        this.phasers = new Phasers(this, this.powerGrid);
        // this.photons = new PhotonTorpedoLauncher(this);
        this.lifeSupport = new LifeSupport(this, 2.0, clock);
        this.ai = new AI(this, galaxy, player);
        this.terminal = terminal;
        this.name = this.constructor.name;
    }

    die() {
        this.lifeSupport.kill();
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
        this.powerGrid.energy = 400;
        this.name = "Klingon Warbird";
    }
}

export class KlingonCommander extends AbstractKlingon {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 100;
        this.powerGrid.energy = 1200;
        this.name = "Klingon Commander";
    }
}

export class KlingonSuperCommander extends AbstractKlingon {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 400;
        this.powerGrid.energy = 1750;
        this.name = "Klingon Super Commander";
    }
}

export class Romulan extends AbstractEnemy {
    constructor(galaxy, player, game) {
        super(galaxy, player, game);
        this.collider.health = 40;
        this.powerGrid.energy = 700;
        this.name = "Romulan";
    }
}
