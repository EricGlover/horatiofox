import {terminal} from "../Terminal.js";
import {Device, lifeSupportType} from "./Devices.js";

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

    die() {
        this.clock.unregister(this.onTimeElapsed);
    }
}