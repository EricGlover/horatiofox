import {GameObject, Mover, Collider} from "../Components.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Sector} from '../Galaxy.js';
import {Device,
    Phasers,
    Shields,
    LifeSupport,
    PhotonTorpedoLauncher,
    DeviceContainer,
    PowerGrid
} from "../Devices.js";

const CONDITION_GREEN = 1;
const CONDITION_YELLOW = 2;
const CONDITION_RED = 3;
const CONDITION_DOCKED = 4;

export default class Enterprise {
    constructor(terminal, clock) {
        this.gameObject = new GameObject(this);
        this.mover = new Mover(this, this.gameObject);
        this.deviceContainer = new DeviceContainer(this);
        this.powerGrid = new PowerGrid(3000.0, this);
        this.collider = new Collider(this, this.gameObject, 80, 80, 1500);

        this.warpFactor = 5.0;

        this.docked = false;
        this.dockedAt = null;
        this.name = "Enterprise";
        this.dead = false;
        this.terminal = terminal;

        // devices
        this.phasers = new Phasers(this, this.powerGrid);

        this.photons = new PhotonTorpedoLauncher(this, 10, 10);
        this.shields = new Shields(this, 2500, this.powerGrid);

        this.shortRangeSensors = new Device(this, "Short Range Sensors");
        // this.longRangeSensors = new Device(this, "Long Range Sensors");
        this.lifeSupport = new LifeSupport(this, 4.0, clock);
        this.warpEngines = new Device(this, "Warp Engines");
        // this.impulseEngines = new Device(this, "Impulse Engines");
        // this.subspaceRadio = new Device(this, "Subspace Radio");
        // this.shuttleCraft = new Device(this, "Shuttle Craft");
        // this.computer = new Device(this, "Computer");
        // this.transporter = new Device(this, "Transporter");
        // this.shieldControl = new Device(this, "Shield Control");
        // this.probesLauncher = new Device(this, "Probe Launcher");
        window.e = this;
    }

    isDead() {
        return this.lifeSupport.reserves <= 0 || this.dead;
    }

    die() {
        this.lifeSupport.kill();
        this.terminal.echo("Enterprise destroyed!!!!\n");
        this.dead = true;
        this.gameObject.removeSelf();
    }

    firePhasersMultiTarget(targets) {
        let totalToFire = targets.reduce((carry, entry) => carry + entry.amount, 0);
        if (totalToFire > this.powerGrid.energy) {
            throw new Error("Not enough energy.");
        }
        // expend energy
        this.powerGrid.useEnergy(totalToFire);
        targets.forEach(entry => {
            this.phasers.fire(entry.amount, entry.enemy)
        });
        // consider putting this somewhere else
        this.phasers.coolDown();
    }

    repairHull() {
        this.collider.repair();
    }

    dock(starbase) {
        if (this.docked) {
            return;
        }
        this.powerGrid.recharge();
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
        if(this.powerGrid.energy < energy) {
            throw new Error("Not enough energy.");
        }

        this.mover.moveToSector(sector);
        this.powerGrid.useEnergy(energy);
    }

    getCondition() {
        let enemies = this.gameObject.quadrant.container.getCountOfGameObjects(AbstractEnemy);
        if (this.docked) {
            return CONDITION_DOCKED;
        } else if (enemies > 0) {
            return CONDITION_RED;
        } else if (this.powerGrid.energy < 1000) {
            return CONDITION_YELLOW;
        } else {
            return CONDITION_GREEN;
        }
    }

    shieldsUp() {
        this.powerGrid.useEnergy(50);
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
