import {GameObject, Mover, Collider} from "../Components.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Sector} from '../Galaxy.js';
import {Phasers, Shields, PhotonTorpedoLauncher} from "../Devices.js";

const CONDITION_GREEN = 1;
const CONDITION_YELLOW = 2;
const CONDITION_RED = 3;
const CONDITION_DOCKED = 4;

export default class Enterprise {
    constructor() {
        this.energyCapacity = 5000.0;
        this.gameObject = new GameObject(this);
        this.mover = new Mover(this, this.gameObject);
        this.collider = new Collider(this, this.gameObject, 80, 80, 1000);
        this.energy = this.energyCapacity;
        this.phasers = new Phasers(this);
        this.warpFactor = 5.0;
        this.photons = new PhotonTorpedoLauncher(this, 10, 10);
        this.shields = new Shields(this);
        this.docked = false;
        this.dockedAt = null;
        this.name = "Enterprise";
    }

    die() {

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

    dock(starbase) {
        if (this.docked) {
            return;
        }
        this.energy = this.energyCapacity;
        this.photons.addTorpedoes(this.photons._capacity - this.photons.getTorpedoCount());
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

    warpTo(sector) {
        if (!sector instanceof Sector) {
            throw new Error("Can't move there");
        }
        // calculate resources needed
        this.mover.moveToSector(sector);
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

    // transfer energy from ship to shields, or vice versa if negative
    // returns {transferred: int, message: string, error: bool}
    transferEnergyToShields(e) {
        let response = {transferred: 0, message: "", error: false};
        // check that you can do the transfer
        if (this.shields.isDamaged()) {
            response.error = true;
            response.message = "Shields damaged";
            return response;
        }

        // I'm a nasty man....

        let shipEnergy = this.energy - e;
        let shieldEnergy = this.shields.units + e;

        if (e > 0) {
            response.message += "Transferring energy to shields.\n";
        } else if (e < 0) {
            response.message += "Draining shields.\n";
        }

        // check the ship side of the transfer
        if (shipEnergy > this.energyCapacity) {
            // only draw what we can hold
            e = this.energyCapacity - this.energy;
            shipEnergy = this.energy - e;
            shieldEnergy = this.shields.units + e;
            response.message += "Ship energy maximized.\nExcess energy return to the shields.\n";
        } else if (shipEnergy < 0) {
            // we don't have that amount, transfer all that we have
            e = this.energy;
            shipEnergy = this.energy - e;
            shieldEnergy = this.shields.units + e;
            response.error = true;
            response.message = `Engineering to bridge--\nScott here. Power circuit problem, Captain.\nI can't drain the shields.`;
        } else if (shipEnergy === 0) {
            // is this a problem ?
            response.message = "Ship energy down to 0!\n";
        }

        // check the shields side of the transfer
        if (shieldEnergy > this.shields.capacity) {
            // only transfer what we can hold
            e = this.shields.capacity - this.shields.units;
            shipEnergy = this.energy - e;
            shieldEnergy = this.shields.units + e;
            response.message += "Excess energy returned to ship energy.\n";
        } else if (shieldEnergy < 0) {
            // we can't drain that much, drain only what we have
            e = this.shields.units;
            shipEnergy = this.energy - e;
            shieldEnergy = this.shields.units + e;
            response.error = true;
            response.message += `Engineering to bridge--\nScott here. Power circuit problem, Captain.\nI can't drain the shields.\n`;
        } else if (shieldEnergy === 0) {
            // this works
            response.message += "Shields drained to 0, shields down.\n";
        }

        // do transfer
        this.shields.transferEnergy(e);
        this.energy -= e;
        response.transferred = e;

        if (this.shields.units === this.shields.capacity) {
            response.message += "Shields maximized.\n"
        }

        return response;
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
