import {terminal} from '../Terminal.js';
import {Component} from "../Components/Component.js";
import clock from "../GameClock.js";

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
export class EngineDeviceType extends DeviceType {
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
export const probeLauncherType = new DeviceType("Probe Launcher", "probeLauncher");

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

