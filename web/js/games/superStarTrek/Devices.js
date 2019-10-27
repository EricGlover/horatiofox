import {terminal} from './Terminal.js';
import {Component, GameObject, Mover, Collider} from "./Components.js";
import {clock} from "./Game.js";

/**
 * Device Types, defined constants make it easier to check the type of device
 * Commands use these to indicate what devices they require to function
 *
 * The alternative approach would be to make a new Device class to extend Device
 * for every type of device, but for the moment at least it seems there are
 * many device types that don't require additional functionality
 * beyond what the Device class itself has, so by defining types
 * we can keep many Devices as instances of just the Device class
 * while still getting the ability to have well defined type attributes
 * propName = the property that the device holder stores the device on
 * name = the name that will be displayed to the user
 */
class DeviceType {
    constructor(name, propName) {
        this.name = name;
        this.propName = propName;
        Object.freeze(this);
    }
}
/// Device Type Singletons
export const shortRangeSensorType = new DeviceType('Short Range Sensors', 'shortRangeSensors');
export const longRangeSensorType = new DeviceType("Long Range Sensors", 'longRangeSensors');
export const phaserType = new DeviceType("Phasers", "phasers");
export const powerGridType = new DeviceType("Power Circuits", "powerGrid");
export const warpEngineType = new DeviceType("Warp Engines", "warpEngines");
export const impulseEngineType = new DeviceType("Impulse Engines", "impulseEngines");
export const lifeSupportType = new DeviceType("Life Support", "lifeSupport");
export const shieldType = new DeviceType("Shields", "shields");
export const photonTorpedoLauncherType = new DeviceType("Photon Torpedo Launcher", "photons");
// export const

/**
 * Our base device class
 * Handles all the logic for devices:
 * 1) taking damage
 * 2) getting repaired
 * 3) checking the type of device
 */
export class Device extends Component {
    constructor(parent, type, chanceOfBeginDamaged = .65) {
        super(type.propName, parent);
        this.parent = parent;
        this.name = type.name;
        this.type = type;

        this._chanceOfBeingDamaged = chanceOfBeginDamaged;

        if(!this.parent.deviceContainer) {
            this.parent.deviceContainer = new DeviceContainer(this.parent);
        }
        this.parent.deviceContainer.addDevices(this);

        this._damage = 0;
    }
    isType(deviceType) {
        if(!deviceType instanceof DeviceType) return false;
        return this.type.name === deviceType.name;
    }
    get damage() {
        return this._damage;
    }

    checkDamage() {
        if(this.isDamaged()) {
            throw new Error(`${this.name} is damaged!`);
        }
    }

    isOk() {
        return this._damage === 0;
    }
    isDamaged() {
        return this._damage > 0;
    }

    takeDamage(damage) {
        if(this._damage === 0) {
            terminal.printLine(`***${this.parent.name}'s ${this.name} has been damaged.`);
        }
        this._damage += damage;
    }

    repair(amount) {
        if(this._damage === 0) return;
        this._damage -= amount;
        if(this._damage === 0) {
            terminal.printLine(`${this.parent.name}'s ${this.name} have been repaired.`);
        }
        /// don't go negative
        this._damage = Math.max(this._damage, 0);
    }

    randomlyDamage() {
        this.takeDamage(Math.random() * 5);
    }

    // roll the dice to see if it becomes damaged
    hitDoesDamage() {
        return Math.random() < this._chanceOfBeingDamaged;
    }

    timeToRepairInFlight() {
        return this._damage * 3.5;
    }

    timeToRepairAtDock() {
        return this._damage;
    }

    // timeToRepair()
}

/**
 * An array of devices
 */
export class DeviceContainer {
    constructor(parent) {
        this.parent = parent;
        this.parent.deviceContainer = this;
        this.devices = [];
        this.onTimeElapse = this.onTimeElapse.bind(this);
        clock.register(this.onTimeElapse)
    }

    onTimeElapse(days) {
        // spread repairs across damaged devices evenly
        let damagedDevices = this.devices.filter(d => d.isDamaged());
        let r = days / damagedDevices.length;
        damagedDevices.forEach(d => d.repair(r));
    }

    addDevices(...devices) {
        this.devices.push(...devices);
    }

    getRandomDevice() {
        let idx = Math.trunc(this.devices.length * Math.random());
        return this.devices[idx];
    }

    damageRandomDevices(damage) {
        let minDamage = Math.max(damage / 10, 2);
        let originalDamage = damage;
        // distribute damage amongst devices
        while(damage > 0) {
            // take a portion of this (make this better latter)
            let portion = Math.max(originalDamage * Math.random(), minDamage);
            let device;
            do {
                device = this.getRandomDevice();
            } while(device.hitDoesDamage());

            device.takeDamage(portion);
            damage -= portion;
        }
    }

    getDevice(type) {
        return this.parent[type.propName];
    }
}
/**
 * Has max, has min 0, can be damaged
 */
export class PowerGrid extends Device {
    constructor(capacity, parent) {
        super(parent, powerGridType, .12);
        this.capacity = capacity;
        this._energy = capacity;
    }
    get energy(){
        return this._energy;
    }
    set energy(e) {
        e = Math.min(e, this.capacity);
        e = Math.max(e, 0);
        this._energy = e;
    }
    getPercent() {
        return this._energy / this.capacity;
    }
    atMax() {
        return this._energy === this.capacity;
    }
    recharge() {
        this._energy = this.capacity;
    }
    useEnergy(e) {
        this.checkDamage();
        if (this._energy - e < -0.01) {
            debugger;
            throw new Error("Not enough energy!");
        }
        this._energy -= e;
    }
    addEnergy(e) {
        this.checkDamage();
        if (this._energy + e > this.capacity) {
            throw new Error("Too much energy.");
        }
        this._energy += e;
    }
}

// todo:::
export class WarpDrive extends Device {
    constructor(parent, powerGrid) {
        super(parent, warpEngineType);
        this.powerGrid = powerGrid;
        this._warpFactor = 5.0;
    }
    get warpFactor() {
        return this._warpFactor;
    }
    set warpFactor(n) {
        this.checkDamage();
        if(typeof n !== "number" || Number.isNaN(n)) {
            return;
        } else if (n < 1.0 || n > 10.0) {
            return;
        }
        this._warpFactor = n;
    }
    // moveTo(){
    //
    // }
}

export class ImpulseEngines extends Device {
    constructor(parent, powerGrid) {
        super(parent, impulseEngineType);
        this.powerGrid = powerGrid;
    }
}

export class LifeSupport extends Device {
    constructor(parent, reserves, clock) {
        super(parent, lifeSupportType);
        this.maxReserves = reserves;
        this.reserves = reserves;
        this.onTimeElapsed = this.onTimeElapsed.bind(this);
        this.clock = clock;
        this.clock.register(this.onTimeElapsed);
        this.terminal = terminal;
    }

    kill() {
        this.clock.unregister(this.onTimeElapsed);
    }

    atMax() {
        return this.reserves === this.maxReserves;
    }

    recharge() {
        this.checkDamage();
        this.reserves = this.maxReserves;
    }

    onTimeElapsed(days) {
        if(this.isDamaged()) {
            this.reserves -= days;
            this.reserves = Math.max(this.reserves, 0);
            if(this.reserves === 0) {
                if(this.parent.die) this.parent.die();
                this.terminal.printLine(`${this.parent.name}'s crew suffocates.`);
            }
        } else if (!this.isDamaged() && !this.atMax()) {
            this.recharge();
        }
    }
}

export class Shields extends Device {
    constructor(parent, capacity) {
        super(parent, shieldType);
        this.capacity = capacity;
        this.up = false;
        this.units = this.capacity;
        this.terminal = terminal;
    }

    printInfo() {
        return `${this.up ? "UP" : "DOWN"}, ${this.units.toFixed(2)} ${(this.units * 100 / this.capacity).toFixed(1)}%`;
    }

    recharge() {
        this.checkDamage();
        this.units = this.capacity;
    }

    lower() {
        this.checkDamage();
        if (!this.up) {
            this.terminal.printLine("Shields already down.");
            return;
        }
        this.up = false;
        this.terminal.printLine("Shields lowered.");
    }

    raise() {
        this.checkDamage();
        if (this.up) {
            this.terminal.printLine("Shields already up.");
            return;
        }
        if(this.isDamaged()) {
            this.terminal.printLine("Shields are damaged.");
            return;
        }
        this.up = true;
        this.terminal.printLine("Shields raised.");
    }

    // returns amount drained
    drain(e) {
        this.checkDamage();
        if (this.units - e < 0) {
            throw new Error("Not enough energy");
        }
        this.units -= e;

        if (this.units === 0) {
            this.lower();
        }
        return this.units;
    }

    // returns amount charged
    charge(e) {
        this.checkDamage();
        // don't exceed capacity
        if (this.units + e > this.capacity) {
            e = this.capacity - this.units;
        }
        this.units += e;
        if (this.units === this.capacity) {
            this.terminal.printLine("Shields at max.");
        }
    }

    takeHit(amount) {
        if (!this.up || this.isDamaged()) {
            this.parent.collider.takeHit(amount);
            return;
        }
        this.terminal.printLine(`${amount.toFixed(2)} hit to shields.`);
        if (this.units < amount) {
            amount -= this.units;
            this.drain(this.units);
            this.parent.collider.takeHit(amount);
        } else {
            this.drain(amount);
        }
    }
}

export class Phasers extends Device {
    constructor(parent, energySystem) {
        super(parent, phaserType);
        if (!energySystem) {
            throw new Error('Phaser must have energy');
        }
        this.energySystem = energySystem;
        this.overheated = false;
        this.amountRecentlyFired = 0;
        this.overheatThreshold = 1500;
        this.terminal = terminal;
        // this is used to calculate the energy that dissipates over distance
        this.scalingFactor = .9;
        this.maxScalingFactor = this.scalingFactor + .01;
        this.minScalingFactor = this.scalingFactor;
    }

    // energy * (scaling ** distance) = damage
    // so energy = damage / (scaling ** distance)
    calculateSureKill(distance, damage) {
        return damage / (this.minScalingFactor ** distance);
    }

    calculateDamage(distance, energy) {
        let scalingBase = this.scalingFactor + (.01 * Math.random());
        return energy * (scalingBase ** distance);
    }

    coolDown() {
        this.amountRecentlyFired = 0;
    }

    // check to see if the phasers overheated
    checkOverHeat() {
        if (this.amountRecentlyFired > this.overheatThreshold) {
            /**
             double chekbrn = (rpow-1500.)*0.00038;
             if (Rand() <= chekbrn) {
                prout("Weapons officer Sulu-  \"Phasers overheated, sir.\"");
                damage[DPHASER] = damfac*(1.0 + Rand()) * (1.0+chekbrn);
            }**/
            let diff = this.amountRecentlyFired - this.overheatThreshold;
            // if (Math.random() <= diff * .00038) {
            //     this.terminal.printLine(`Phasers overheated!`);
            //     this._damaged = true;
            // }
            if (Math.random() <= diff * .0038) {
                this.terminal.printLine(`Phasers overheated!`);
                this.randomlyDamage();
            }
        }
    }

    fire(amount, target) {
        if (amount <= 0) {
            console.error("Can't fire amount ", amount);
            return;
        }
        if (!target) {
            console.error("Need a target, ", target);
            return;
        }
        // target needs to be targetable
        if (!(target.collider instanceof Collider)) {
            console.error("You can't hit that", target);
            return;
        }
        // device can't be damaged
        this.checkDamage();
        if (this.isDamaged()) {
            this.terminal.printLine('Phaser control damaged.');
            return;
        }
        if (!this.parent.gameObject) {
            console.error('derp a lerp.');
            debugger;
            return;
        }

        if (!target.gameObject || !target.gameObject.isInGame()) {
            console.error("Can't shoot something removed from the game.");
            return;
        }

        // get distance
        let distance = Galaxy.calculateDistance(this.parent.gameObject.sector, target.gameObject.sector);
        // distance scaling
        let damage = this.calculateDamage(distance, amount);

        // if they have shields hit the shields
        if (target.shields instanceof Shields) {
            target.shields.takeHit(damage);
        } else if (target.collider instanceof Collider) {   // else the thing itself takes a beating
            target.collider.takeHit(damage);
        }
        // target.collider.takeHit(damage);

        this.amountRecentlyFired += amount;
        this.checkOverHeat();
    }
}

class Torpedo {
    constructor() {
        this.gameObject = new GameObject(this, false);
        this.mover = new Mover(this, this.gameObject);
        this.collider = new Collider(this, this.gameObject, 100, 100, 1);
        this.damage = 100;
    }

    die() {
        this.gameObject.removeSelf();
    }
}

export class PhotonTorpedoLauncher extends Device {
    constructor(parent, count = 0, capacity = 0) {
        super(parent, photonTorpedoLauncherType);
        this.terminal = terminal;
        this._capacity = capacity;
        this._torpedoes = count;
    }

    addTorpedoes(n) {
        this.checkDamage();
        if (n <= 0) {
            return;
        } else if (this._torpedoes + n > this._capacity) {
            this._torpedoes = this._capacity;
            return;
        }
        this._torpedoes += n;
    }

    getTorpedoCount() {
        return this._torpedoes;
    }

    calcAngleDegrees(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    // fire at sector x y , can be floats or ints
    fire(sectorX, sectorY) {
        this.checkDamage();
        if (this.isDamaged()) {
            this.terminal.echo("Photon torpedoes are damaged and can't fire.");
            return;
        }
        if (this._torpedoes <= 0) {
            this.terminal.echo("Not enough torpedoes.");
            return;
        }
        this._torpedoes--;
        // get global x y for target
        let x = this.parent.gameObject.quadrant.globalX + sectorX;
        let y = this.parent.gameObject.quadrant.globalY + sectorY;

        // make torpedo
        let torpedo = new Torpedo();
        // place torpedo at our current position
        torpedo.gameObject.placeIn(this.parent.gameObject.galaxy,
            this.parent.gameObject.quadrant,
            this.parent.gameObject.sector);

        /// calculate the direction to shoot the torpedo
        let quadrant = this.parent.gameObject.quadrant;
        // deltas are to - from, BUT because the y axis is inverted from
        // the normal math y axis you'll need to flip the y
        let deltaX = x - this.parent.gameObject.x;
        let deltaY = -1 * (y - this.parent.gameObject.y);
        let theta = Math.atan2(deltaY, deltaX);    // -PI , PI

        //
        let moveGenerator = torpedo.mover.moveInDirection(theta, .5, Math.hypot(deltaX, deltaY));
        let ret;
        let keepGoing = true;
        let hit = false;
        let thingHit = null;
        let trackingLocations = [];
        do {
            ret = moveGenerator.next(keepGoing);
            // if we've left the quadrant then stop
            if (torpedo.gameObject.quadrant !== quadrant) {
                console.log("We've left the quadrant.", quadrant, torpedo.gameObject.quadrant);
                moveGenerator.next(false);
                break;
            }
            trackingLocations.push(torpedo.gameObject.getSectorLocationFloat(false));
            // check for collisions, could do a better job of broad sweeping here...
            // get stuff in the torpedo's current sector, and the adjacent ones
            // and nearby sectors
            let sectors = torpedo.gameObject.sector.getAdjacentSectors(true);

            sectors.forEach(sector => {
                if (hit) return;
                sector.container.getAllGameObjects().forEach(obj => {
                    if (hit) return;
                    // check that it's a collider and not the thing firing the torpedo, and it's not the torpedo
                    if (obj.collider && obj !== torpedo && obj !== this.parent) {
                        hit = torpedo.collider.collision(obj);
                        if (hit) {
                            thingHit = obj;
                            console.log("HIT!!!", obj);
                        }
                    }
                });
            });
            if (hit) {
                moveGenerator.next(false);
                break;
            }
        } while (!ret.done);
        // print tracking coordinates
        for (let i = 0; i < trackingLocations.length; i++) {
            //print first and last, otherwise skip every other one
            if (i === 0) {
                this.terminal.echo(`${trackingLocations[i]}    `);
            } else if (i === trackingLocations.length - 1) {
                this.terminal.echo(`${trackingLocations[i]}`);
            } else if (i % 2 === 0) {
                this.terminal.echo(`${trackingLocations[i]}    `);
            }

        }
        this.terminal.echo("\n");
        // we've hit something or left the quadrant
        if (hit) {
            thingHit.collider.takeHit(torpedo.damage);
        } else {
            this.terminal.printLine("Torpedo missed and has left the quadrant!");
        }
        torpedo.die();
    }
}