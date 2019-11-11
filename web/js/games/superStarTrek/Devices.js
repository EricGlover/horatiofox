import {terminal} from './Terminal.js';
import {Component, GameObject, Mover, Collider} from "./Components.js";
import clock from "./GameClock.js";
import {Sector} from "./Galaxy.js";
import {AbstractEnemy} from "./Enemies/Enemies";

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
 *
 *
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

/**
 * warp engines and impulse engines
 */
class EngineDeviceType extends DeviceType {
    constructor(name, propName) {
        super(name, propName);
    }
}

/// Device Type Singletons
export const shortRangeSensorType = new DeviceType('Short Range Sensors', 'shortRangeSensors');
export const longRangeSensorType = new DeviceType("Long Range Sensors", 'longRangeSensors');
export const phaserType = new DeviceType("Phasers", "phasers");
export const powerGridType = new DeviceType("Power Circuits", "powerGrid");
export const warpEngineType = new EngineDeviceType("Warp Engines", "warpEngines");
export const impulseEngineType = new EngineDeviceType("Impulse Engines", "impulseEngines");
export const lifeSupportType = new DeviceType("Life Support", "lifeSupport");
export const shieldType = new DeviceType("Shields", "shields");
export const photonTorpedoLauncherType = new DeviceType("Photon Torpedo Launcher", "photons");
export const subspaceRadioType = new DeviceType("Subspace Radio", "subspaceRadio");

// export const

/**
 * Our base device class
 * Handles all the logic for devices:
 * 1) taking damage
 * 2) getting repaired
 * 3) checking the type of device  : use Device.isType(device, deviceType)
 */
export class Device extends Component {
    constructor(parent, type, chanceOfBeginDamaged = .65) {
        super(type, parent);
        this.parent = parent;
        this.name = type.name;
        this.type = type;

        this._chanceOfBeingDamaged = chanceOfBeginDamaged;

        if (!this.parent.deviceContainer) {
            this.parent.deviceContainer = new DeviceContainer(this.parent);
        }
        this.parent.deviceContainer.addDevices(this);

        this._damage = 0;
    }

    static isType(device, deviceType) {
        if(!(device instanceof Device)) {
            return false;
        }
        return device.isType(deviceType);
    }

    isType(deviceType) {
        if (!deviceType instanceof DeviceType) return false;
        return this.type.name === deviceType.name;
    }

    get damage() {
        return this._damage;
    }

    checkDamage() {
        if (this.isDamaged()) {
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
        if (this._damage === 0) {
            terminal.printLine(`***${this.parent.name}'s ${this.name} has been damaged.`);
        }
        this._damage += damage;
    }

    repair(amount) {
        if (this._damage === 0) return;
        this._damage -= amount;
        if (this._damage === 0) {
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
        return this._damage / DEVICE_REPAIR_SPEED_IN_FLIGHT;
    }

    timeToRepairAtDock() {
        return this._damage / DEVICE_REPAIR_SPEED_DOCKED;
    }
}

export const REPAIR_STRATEGY_EVEN = 'even';
export const REPAIR_STRATEGY_LEAST = 'least';
export const REPAIR_STRATEGY_MOST = 'most';
export const REPAIR_STRATEGY_PRIORITY = 'priority';
const REPAIR_MODES = [REPAIR_STRATEGY_EVEN, REPAIR_STRATEGY_LEAST, REPAIR_STRATEGY_MOST, REPAIR_STRATEGY_PRIORITY];
const DEVICE_REPAIR_SPEED_DOCKED = 1;
const DEVICE_REPAIR_SPEED_IN_FLIGHT = .3;

/**
 * An array of devices
 * Handles the repair strategy logic
 * Uses the game clock
 */
export class DeviceContainer {
    constructor(parent) {
        this.parent = parent;
        this.parent.deviceContainer = this;
        this.devices = [];
        this.repairSpeed = DEVICE_REPAIR_SPEED_IN_FLIGHT;   //speed at which devices are repaired (docked = 1)
        this.repairMode = REPAIR_STRATEGY_EVEN;
        this.onTimeElapse = this.onTimeElapse.bind(this);
        clock.register(this.onTimeElapse);
        // <int> priority # => List <device>
        // also <string> device type name => priority #
        this.repairPriorities = new Map();
        this.prioritiesInUse = new Set();
    }

    setRepairSpeed(n) {
        this.repairSpeed = n;
    }

    setRepairMode(mode) {
        if (!REPAIR_MODES.some(m => mode === m)) {
            throw new Error(`${mode} is not a valid repair mode.`);
        }
        this.repairMode = mode;
    }

    _repairDevicesEvenly(devices, totalAmount) {
        // r = amount to repair per device
        let r = totalAmount / devices.length;
        let repairAmountLeft = totalAmount;
        let remainingDevices = devices.slice();
        // dont over-repair devices .....
        // if we have devices that have less damage than we're repairing each device
        // then repair them first and recalculate how much we can repair the
        // remaining devices
        let devicesWithLessDamage;
        do {
            devicesWithLessDamage = remainingDevices.filter(d => d.damage < r && d.damage > 0);
            if (devicesWithLessDamage.length === 0) break;
            remainingDevices = remainingDevices.filter(d => d.damage >= r && d.damage > 0);
            devicesWithLessDamage.forEach(d => {
                let toRepair = Math.min(d.damage, r, repairAmountLeft);
                if (toRepair <= 0) return;
                d.repair(toRepair);
                repairAmountLeft -= toRepair;
            });
            r = repairAmountLeft / remainingDevices.length;
        } while (devicesWithLessDamage.length > 0 && repairAmountLeft > 0);

        if (repairAmountLeft <= 0) return;
        // repair the remaining devices
        remainingDevices.forEach(d => {
            let toRepair = Math.min(d.damage, r, repairAmountLeft);
            if (toRepair <= 0) return;
            d.repair(toRepair);
            repairAmountLeft -= toRepair;
        });
    }

    onTimeElapse(days) {
        // debugger;
        // todo:: check for repair priority
        let repairAmount = days * this.repairSpeed;
        let damagedDevices = this.devices.filter(d => d.isDamaged());
        switch (this.repairMode) {
            case REPAIR_STRATEGY_EVEN:
                // spread repairs across damaged devices evenly
                this._repairDevicesEvenly(damagedDevices, repairAmount);
                break;
            case REPAIR_STRATEGY_LEAST:
                // repair the least damaged device first
                damagedDevices.sort((a, b) => {
                    return a.damage - b.damage;
                });
                // repair loop
                for (let i = 0; i < damagedDevices.length && repairAmount > 0; i++) {
                    let device = damagedDevices[i];
                    let toRepair = Math.min(repairAmount, device.damage);
                    device.repair(toRepair);
                    repairAmount -= toRepair;
                }
                break;
            case REPAIR_STRATEGY_MOST:
                // repair the most damaged device first
                damagedDevices.sort((a, b) => {
                    return b.damage - a.damage;
                });
                // repair loop
                for (let i = 0; i < damagedDevices.length && repairAmount > 0; i++) {
                    let device = damagedDevices[i];
                    let toRepair = Math.min(repairAmount, device.damage);
                    device.repair(toRepair);
                    repairAmount -= toRepair;
                }
                break;
            case REPAIR_STRATEGY_PRIORITY:
                // spread repairs evenly amongst devices on the same priority level
                // sort the used priority numbers
                let priorityNumbers = [...this.prioritiesInUse.keys()];
                priorityNumbers.sort();
                // iterate through the devices by their priority number
                for (let i = 0; i < priorityNumbers.length && repairAmount > 0; i++) {
                    let priorityNumber = priorityNumbers[i];
                    // get device list
                    let deviceList = this.repairPriorities.get(priorityNumber) || [];
                    // calc total current device damage
                    let totalDamage = deviceList.reduce((carry, d) => d.damage + carry, 0);
                    // do the repairs
                    this._repairDevicesEvenly(deviceList, repairAmount);
                    // calculate amount repaired and decrement from total
                    let newTotalDamage = deviceList.reduce((carry, d) => d.damage + carry, 0);
                    let repaired = totalDamage - newTotalDamage;
                    repairAmount -= repaired;
                }
                // todo:: update the info section to include an explanation of this stuff....
                break;
            default:
                console.error(`repair mode ${this.repairMode} invalid.`);
        }

    }

    addDevices(...devices) {
        let prevLength = this.devices.length;
        this.devices.push(...devices);
        // don't remake the whole repair priority structure , just add the new entries
        // set the priority of the new devices to their index in this.devices + 1
        devices.forEach((d, i) => this.setRepairPriority(d.type, prevLength + 1 + i));
        // this.makeRepairPriority();
    }

    getRandomDevice() {
        let idx = Math.trunc(this.devices.length * Math.random());
        return this.devices[idx];
    }

    damageRandomDevices(damage) {
        let minDamage = Math.max(damage / 10, 2);
        let originalDamage = damage;
        // distribute damage amongst devices
        while (damage > 0) {
            // take a portion of this (make this better latter)
            let portion = Math.max(originalDamage * Math.random(), minDamage);
            let device;
            do {
                device = this.getRandomDevice();
            } while (device.hitDoesDamage());

            device.takeDamage(portion);
            damage -= portion;
        }
    }

    getDevice(type) {
        return this.parent[type.propName];
    }

    getDevices() {
        return this.devices.slice();
    }

    /**
     * @param deviceType DeviceType
     * @param priority int
     */
    setRepairPriority(deviceType, priority) {
        // get device and check that we have that device
        let device = this.devices.find(d => d.type.name === deviceType.name);
        if (!device) return;

        // remove old record
        if (this.repairPriorities.has(deviceType.name)) {
            let oldP = this.repairPriorities.get(deviceType.name);
            if (oldP === priority) return;
            let list = this.repairPriorities.get(oldP);
            // remove device from list
            list = list.filter(d => {
                return d.type.name !== deviceType.name;
            });

            if (list.length === 0) {
                // if there's no devices on that priority #
                // remove the list from the map and remove the number from the set
                this.repairPriorities.delete(oldP);
                this.prioritiesInUse.delete(oldP);
            } else {
                this.repairPriorities.set(oldP, list);
            }
        }

        // add new record
        this.prioritiesInUse.add(priority);
        this.repairPriorities.set(deviceType.name, priority);
        let pList = this.repairPriorities.get(priority) || [];
        pList.push(device);
        this.repairPriorities.set(priority, pList);
    }

    makeRepairPriority() {
        this.devices.forEach((device, i) => {
            this.setRepairPriority(device.type, i + 1);
        });
    }

    // return map <device type name> => int ?
    getRepairPriorities() {
        return this.repairPriorities;
    }

    getDeviceRepairPriority(deviceType) {
        return this.repairPriorities.get(deviceType.name) || 0;
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

    get energy() {
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

/**
 * Warp Engines and Impulse Engines are both instances of Engines but they have different types
 * Controls setting the warpFactor (impulse can't, warp has a range)
 * Uses gameObject and Galaxy to calculate distance
 * Uses mover to move the game object
 * Uses power grid to consume power
 * This could be extended to different engines
 */
export class Engines extends Device {
    constructor(parent, type, powerGrid, gameObject, mover, minWarp, maxWarp, adjustableWarpFactor = false) {
        if (!(type instanceof EngineDeviceType)) {
            throw new Error("Engines must have a type deriving from EngineDeviceType.");
        }
        if(!(gameObject instanceof GameObject)) {
            throw new Error("Engines must have a game object");
        }
        if(!(mover instanceof Mover)) {
            throw new Error("Engines must have a mover");
        }
        if(!(powerGrid instanceof PowerGrid)) {
            throw new Error("Engines require a power grid");
        }
        super(parent, type);
        this.powerGrid = powerGrid;
        this.mover = mover;
        this.gameObject = gameObject;
        this._warpFactor = minWarp;
        this._warpFactorIsAdjustable = adjustableWarpFactor;
        this._maxWarpFactor = maxWarp;
        this._minWarpFactor = minWarp;
    }

    get warpFactor() {
        return this._warpFactor;
    }

    set warpFactor(n) {
        if (!this._warpFactorIsAdjustable) {
            throw new Error("Warp factor is not adjustable");
        }
        this.checkDamage();
        if (typeof n !== "number" || Number.isNaN(n)) {
            return;
        } else if (n < this._minWarpFactor || n > this._maxWarpFactor) {
            return;
        }
        this._warpFactor = n;
    }

    calculateTimeRequired(distance) {
        return distance / Math.pow(this.warpFactor, 2);
    }

    calculateEnergyUsage(distance) {
        let energy = .1 * distance * Math.pow(this.warpFactor, 3);
        if (this.parent.shields && this.parent.shields.up) energy *= 2;
        return energy;
    }

    moveTo(sector) {
        if (!sector instanceof Sector) {
            throw new Error("Can't move there");
        }
        this.checkDamage();
        this.powerGrid.checkDamage();

        // calculate distance, and energy required
        let distance = Galaxy.calculateDistance(this.gameObject.sector, sector);
        //( .1 * distance in sectors = distance in quadrants ) * warpFactor ^ 3
        let energy = this.calculateEnergyUsage(distance);

        if (this.powerGrid.energy < energy) {
            throw new Error("Not enough energy.");
        }

        this.mover.moveToSector(sector);
        this.powerGrid.useEnergy(energy);
    }

    static makeWarpEngines(parent, powerGrid, gameObject, mover) {
        return new Engines(parent, warpEngineType, powerGrid, gameObject, mover, 1.0, 10.0, true);
    }

    static makeImpulseEngines(parent, powerGrid, gameObject, mover) {
        return new Engines(parent, impulseEngineType, powerGrid, gameObject, mover, .975, .975, false);
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
        this.reserves = this.maxReserves;
    }

    onTimeElapsed(days) {
        if (this.isDamaged()) {
            this.reserves -= days;
            this.reserves = Math.max(this.reserves, 0);
            if (this.reserves === 0) {
                if (this.parent.die) this.parent.die();
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
        if (this.isDamaged()) {
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
    constructor(firedFrom) {
        this.gameObject = new GameObject(this, false);
        this.mover = new Mover(this, this.gameObject);
        this.proximity = new Collider(this, this.gameObject, 100, 100, 1);
        this.collider = new Collider(this, this.gameObject, 1, 1, 1);
        this.damage = 100;
        this.firedFrom = firedFrom;
    }

    die() {
        this.gameObject.removeSelf();
    }

    // we can't hit ourselves, things without colliders, or the ship we were fired from
    _canHit(obj) {
        return obj !== this && obj.collider && obj !== this.firedFrom;
    }

    // did obj trigger torpedoes proximity sensor ?
    proximityHit(obj) {
        if (!this._canHit(obj)) return false;
        if (!(obj instanceof AbstractEnemy)) return false;
        return this.proximity.collision(obj);
    }

    // did obj collide with the body of the torpedo
    bodyHit(obj) {
        if (!this._canHit(obj)) return false;
        return this.collider.collision(obj);
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
        let torpedo = new Torpedo(this.parent);
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

            // check for collisions
            sectors.forEach(sector => {
                if (hit) return;
                sector.container.getAllGameObjects().forEach(obj => {
                    if (hit) return;
                    if(torpedo.proximityHit(obj) || torpedo.bodyHit(obj)) {
                        hit = true;
                        thingHit = obj;
                        console.log("HIT!!!", obj);
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