import {GameObject, Mover, Collider} from "../Components.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Sector} from '../Galaxy.js';
import {Phasers, Shields, PhotonTorpedoLauncher} from "../Devices.js";

const CONDITION_GREEN = 1;
const CONDITION_YELLOW = 2;
const CONDITION_RED = 3;
const CONDITION_DOCKED = 4;

export default class Enterprise {
    constructor(terminal) {
        this.energyCapacity = 3000.0;
        this.gameObject = new GameObject(this);
        this.mover = new Mover(this, this.gameObject);
        this.maxHullIntegrity = 1500;
        this.collider = new Collider(this, this.gameObject, 80, 80, this.maxHullIntegrity);
        this.energy = this.energyCapacity;
        this.phasers = new Phasers(this);
        this.warpFactor = 5.0;
        this.photons = new PhotonTorpedoLauncher(this, 10, 10);
        this.shields = new Shields(this);
        this.shields.raise();
        this.docked = false;
        this.dockedAt = null;
        this.name = "Enterprise";
        this.dead = false;
        this.terminal = terminal;
    }

    isDead() {
        return this.dead;
    }

    die() {
        this.terminal.echo("Enterprise destroyed!!!!\n");
        this.dead = true;
        this.gameObject.removeSelf();
    }

    firePhasersMultiTarget(targets, leaveShieldsDown = false) {
        // fast shield control ?
        if (this.shields.up) {
            // do fast shield control
            // lower shields
            if (!leaveShieldsDown) {
                // raise shields
            }
        }
        let totalToFire = targets.reduce((carry, entry) => carry + entry.amount, 0);
        if (totalToFire > this.energy) {
            // no
            debugger;
        }
        // expend energy
        this.useEnergy(totalToFire);
        targets.forEach(entry => {
            this.phasers.fire(entry.amount, entry.enemy)
        });
        // consider putting this somewhere else
        this.phasers.coolDown();
    }

    repairHull() {
        this.collider.health = this.maxHullIntegrity;
    }

    dock(starbase) {
        if (this.docked) {
            return;
        }
        this.energy = this.energyCapacity;
        this.photons.addTorpedoes(this.photons._capacity - this.photons.getTorpedoCount());
        this.shields.recharge();
        this.repairHull();
        this.docked = true;
        this.dockedAt = starbase;
    }

    undock() {
        this.docked = false;
        this.dockedAt = null;
    }

    impulseTo(sector) {
        // calculate resources needed
        this.mover.moveToSector(sector);
    }

    setWarpFactor(warpFactor) {
        if(typeof warpFactor !== "number" || Number.isNaN(warpFactor)) {
            return;
        } else if (warpFactor < 1.0 || warpFactor > 10.0) {
            return;
        }
        this.warpFactor = warpFactor;
    }

    warpTo(sector) {
        if (!sector instanceof Sector) {
            throw new Error("Can't move there");
        }
        if(this.docked) this.undock();

        // calculate distance, and energy required
        let distance = Galaxy.calculateDistance(this.gameObject.sector, sector);
        let energy = .1 * distance * Math.pow(this.warpFactor, 3);
        if(this.shields.up) energy *= 2;
        console.log(energy);
        if(this.energy < energy) {
            throw new Error("Not enough energy.");
        }

        this.mover.moveToSector(sector);
        this.useEnergy(energy);
    }

    hasLifeSupport() {
        // TODO::
        return true;
    }

    getCondition() {
        let enemies = this.gameObject.quadrant.container.getCountOfGameObjects(AbstractEnemy);
        if (this.docked) {
            return CONDITION_DOCKED;
        } else if (enemies > 0) {
            return CONDITION_RED;
        } else if (this.energy < 1000) {
            return CONDITION_YELLOW;
        } else {
            return CONDITION_GREEN;
        }
    }

    useEnergy(e) {
        if (this.energy - e <= 0) {
            throw new Error("Not enough energy!");
        }
        this.energy -= e;
    }

    addEnergy(e) {
        if (this.energy + e > this.energyCapacity) {
            throw new Error("Too much energy.");
        }
        this.energy += e;
    }

    shieldsUp() {
        this.useEnergy(50);
        this.shields.raise();
    }

    shieldsDown() {
        this.shields.lower();
    }

    printCondition() {
        switch (this.getCondition()) {
            case CONDITION_DOCKED:
                return "DOCKED";
            case CONDITION_GREEN:
                return "GREEN";
            case CONDITION_YELLOW:
                return "YELLOW";
            case CONDITION_RED:
                return "RED";
            default:
                console.error('condition not recognized.');
        }
    }
}
