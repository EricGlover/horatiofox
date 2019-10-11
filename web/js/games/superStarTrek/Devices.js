import {terminal} from './Terminal.js';


class Device {
    constructor(damaged) {
        this._damaged = damaged;    // apparently this is should be an int not a bool so you can do repairs
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
        if(this.amountRecentlyFired > this.overheatThreshold) {
            /**
            double chekbrn = (rpow-1500.)*0.00038;
            if (Rand() <= chekbrn) {
                prout("Weapons officer Sulu-  \"Phasers overheated, sir.\"");
                damage[DPHASER] = damfac*(1.0 + Rand()) * (1.0+chekbrn);
            }**/
            let diff = this.amountRecentlyFired - this.overheatThreshold;
            if(Math.random() <= diff * .00038) {
                this.terminal.printLine(`Phasers overheated!`);
                this._damaged = true;
            }
        }
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
            this.terminal.printLine('Phaser control damaged.');
            return;
        }
        if(!this.parent.gameObject) {
            console.error('derp a lerp.');
            debugger;
            return;
        }
        // get distance
        let distance = Galaxy.calculateDistance(this.parent.gameObject.sector, target.gameObject.sector);
        // distance scaling
        let damage = this.calculateDamage(distance, amount);
        target.target.takeHit(damage);
        this.amountRecentlyFired += amount;
        this.checkOverHeat();
    }
}