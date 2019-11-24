import {Device, powerGridType} from "./Devices.js";

/**
 * Has max, has min 0, can be damaged
 */
export class PowerGrid extends Device {
    constructor(capacity, parent) {
        super(parent, powerGridType, .01);
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