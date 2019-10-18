import {terminal} from './Terminal.js';
import {GameObject, Mover, Collider} from "./Components.js";

class Device {
    constructor() {
        this._damaged = false;    // apparently this is should be an int not a bool so you can do repairs
    }

    isDamaged() {
        return this._damaged;
    }
}

export class DeviceDamagedError extends Error {
}

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
        if (!this.up) {
            this.terminal.printLine("Shields already down.");
            return;
        }
        this.up = false;
        this.terminal.printLine("Shields lowered.");
    }

    raise() {
        if (this.up) {
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
        if (this.isDamaged()) {
            throw new DeviceDamagedError(`Can't transfer energy because shields are damaged.`);
        }
        if (e > 0) {
            return this.charge(e);
        } else if (e < 0) {
            return this.drain(e);
        }
    }

    // returns amount drained
    drain(e) {
        if (this.units - e < 0) {
            throw new Error("Not enough energy");
        }
        this.units -= e;

        if (this.units === 0) {
            this.up = false;
        }
        return this.units;
    }

    // returns amount charged
    charge(e) {
        // don't exceed capacity
        if (this.units + e > this.capacity) {
            e = this.capacity - this.units;
        }
        this.units += e;
        return e;
    }

    takeHit(amount) {

    }
}

export class Phasers extends Device {
    constructor(parent) {
        super();
        this.parent = parent;
        if(!this.parent.energy) {
            throw new Error('Phaser parent must have energy');
        }
        this.parent.phasers = this;
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
            if (Math.random() <= diff * .00038) {
                this.terminal.printLine(`Phasers overheated!`);
                this._damaged = true;
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
        if (this.isDamaged()) {
            this.terminal.printLine('Phaser control damaged.');
            return;
        }
        if (!this.parent.gameObject) {
            console.error('derp a lerp.');
            debugger;
            return;
        }

        if(!target.gameObject || !target.gameObject.isInGame()) {
            console.error("Can't shoot something removed from the game.");
            return;
        }

        // get distance
        let distance = Galaxy.calculateDistance(this.parent.gameObject.sector, target.gameObject.sector);
        // distance scaling
        let damage = this.calculateDamage(distance, amount);

        // if they have shields hit the shields
        // if(target.shields instanceof Shields) {
        //     target.shields.takeHit(damage);
        // } else if (target.collider instanceof Collider) {   // else the thing itself takes a beating
        //     target.collider.takeHit(damage);
        // }
        target.collider.takeHit(damage);

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
        super();
        this.parent = parent;
        this.parent.photons = this;
        this.terminal = terminal;
        this._capacity = capacity;
        this._torpedoes = count;
    }

    addTorpedoes(n) {
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
        let x = this.parent.gameObject.quadrant.x + sectorX;
        let y = this.parent.gameObject.quadrant.y + sectorY;

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
        // debugger;
        console.log(deltaX, deltaY);

        //
        let moveGenerator = torpedo.mover.moveInDirection(theta, .5, Math.hypot(deltaX, deltaY));
        let ret;
        let keepGoing = true;
        let hit = false;
        let thingHit = null;
        do {
            ret = moveGenerator.next(keepGoing);
            // if we've left the quadrant then stop
            if (torpedo.gameObject.quadrant !== quadrant) {
                console.log("We've left the quadrant.", quadrant, torpedo.gameObject.quadrant);
                moveGenerator.next(false);
                break;
            }
            this.terminal.echo(`${torpedo.gameObject.getSectorLocationFloat(false)}    `);
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
            })
            if (hit) {
                moveGenerator.next(false);
                break;
            }
        } while (!ret.done);
        this.terminal.echo("\n");
        // we've hit something or left the quadrant
        if (hit) {
            thingHit.collider.takeHit(torpedo.damage);
        } else {
            this.terminal.echo("Torpedo missed and has left the quadrant!");
        }
        torpedo.die();
    }
}