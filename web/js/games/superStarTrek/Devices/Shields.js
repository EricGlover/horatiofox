import {terminal} from "../Terminal.js";
import {Device, shieldType} from "./Devices.js";

export class Shields extends Device {
    constructor(parent, capacity) {
        super(parent, shieldType);
        this.capacity = capacity;
        this.up = false;
        this.units = this.capacity;
        this.terminal = terminal;
    }

    remainingCapacity() {
        return this.capacity - this.units;
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