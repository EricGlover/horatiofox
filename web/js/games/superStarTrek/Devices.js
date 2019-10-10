import {terminal} from './Terminal.js';


class Device {
    constructor(damaged) {
        this._damaged = damaged;
    }
    isDamaged() {
        return this._damaged;
    }
}

export class DeviceDamagedError extends Error{}

export class Shields extends Device {
    constructor(parent) {
        super();
        this.parent = parent;
        this.shields = this.parent;
        this.capacity = 2500;
        this.up = false;
        this.units = 2500;
        this.terminal = terminal;
    }
    printInfo() {
        return `${this.up ? "UP" : "DOWN"}, 100% ${this.units} units`;
    }
    recharge() {
        this.units = this.capacity;
    }

    lower() {
        if(!this.up) {
            this.terminal.printLine("Shields already down.");
            return;
        }
        this.up = false;
        this.terminal.printLine("Shields lowered.");
    }

    raise() {
        if(this.up) {
            this.terminal.printLine("Shields already up.");
            return;
        }
        this.up = true;
        this.terminal.printLine("Shields raised.");
    }
    // returns amount exchanged
    // throws error when not enough energy, or damaged
    // transfer energy to the shields
    transferEnergy(e) {
        if(this.isDamaged()) {
            throw new DeviceDamagedError(`Can't transfer energy because shields are damaged.`);
        }
        if(e > 0) {
            return this.charge(e);
        } else if (e < 0 ) {
            return this.drain(e);
        }
    }
    // returns amount drained
    drain(e) {
        if(this.units - e < 0) {
            throw new Error("Not enough energy");
        }
        this.units -= e;

        if(this.units === 0) {
            this.up = false;
        }
        return this.units;
    }
    // returns amount charged
    charge(e) {
        // don't exceed capacity
        if(this.units + e > this.capacity) {
            e = this.capacity - this.units;
        }
        this.units += e;
        return e;
    }
}

// can be hit with weapons
export class Target {
    constructor(parent, health = 1) {
        this.parent = parent;
        this.parent.target = this;
        this.health = health;
        this.terminal = terminal;
    }
    takeHit(damage) {
        this.health -= damage;
        this.terminal.printLine(`${damage.toFixed(2)} unit hit on ${this.parent.name} at ${this.parent.gameObject.getSectorLocation()}`)
        if(this.health < 0) {
            if(this.parent.die) {
                this.parent.die();
            } else {
                let name = this.parent.name ? this.parent.name : 'something';
                this.terminal.echo(`${name} destroyed.`);
            }
        }
    }
}

export class Phasers extends Device {
    constructor(parent) {
        super();
        this.parent = parent;
        this.phasers = this.parent;
        this.phaseFactor = 2.0;
    }
    fire(amount, target) {
        if(amount <= 0) {
            return;
        }
        if(!target) {
            return;
        }
        // target needs to be targetable
        if( !(target.target instanceof Target) ) {
            console.error("You can't hit that", target);
            return;
        }
        // device can't be damaged
        if(this.isDamaged()) {
            // do something here ?
           return;
        }
        if(!this.parent.gameObject) {
            debugger;
        }
        // get distance
        let distance = Galaxy.calculateDistance(this.parent.gameObject.sector, target.gameObject.sector);
        // distance scaling
        let damage = amount * .9 ** distance;
        target.target.takeHit(damage);
    }
}