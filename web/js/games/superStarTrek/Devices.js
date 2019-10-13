import {terminal} from './Terminal.js';
import {GameObject, Mover} from "./Components.js";

class Device {
    constructor() {
        this._damaged = false;    // apparently this is should be an int not a bool so you can do repairs
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
// colliders are rectangles or points
// points have width = 0, height = 0
// width and height are in units 1/100 * sector width
export class Collider {
    constructor(parent, gameObject, width = 0, length = 0, health = 1) {
        this.parent = parent;
        this.parent.collider = this;
        this.health = health;
        this.terminal = terminal;
        this.width = width;
        this.length = length;
        this.gameObject = gameObject;
    }
    getCoordinates() {
        let topLeft = {x: this.gameObject.x, y: this.gameObject.y};
        let bottomLeft = {x: topLeft.x, y: topLeft.y + this.length};
        let topRight = {x: topLeft.x + this.width, y: topLeft.y};
        let bottomRight = {x: topRight.x, y: bottomLeft.y};
        let center = {x: topLeft.x + this.width / 2, y: topLeft.y + this.width / 2};
        return {
            topLeft,
            bottomLeft,
            topRight,
            bottomRight,
            center
        }
    }
    getLeftSideX() {
        return this.gameObject.x;
    }
    getRightSideX() {
        return this.gameObject.x + (this.width / 100);
    }
    getTopSideY() {
        return this.gameObject.y;
    }
    getBottomSideY() {
        return this.gameObject.y + (this.length / 100);
    }
    collision(a) {
        if(!a.collider) {
            console.log(a, ' is not a collider.');
            return false;
        }
        return Collider.collision(this, a.collider);
    }
    static collision(a, b) {
        if(! a instanceof Collider || ! b instanceof Collider) {
            console.error('both a and b need to be colliders, ', a, b);
            return false;
        }
        if(a === b) {
            return false;
        }
        // if a left side < b right side
        // and a right side is > b left side
        // and a top side is < b bottom side
        // and a bottom side is > b top side then collision
        if(a.getLeftSideX() < b.getRightSideX()
            && a.getRightSideX() > b.getLeftSideX()
            && a.getTopSideY() < b.getBottomSideY()
            && a.getBottomSideY() > b.getTopSideY()
        )  {
            return true;
        }
        return false;
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
        if( !(target.collider instanceof Collider) ) {
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

/// todo:: collision detection
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
        if(n <= 0) {
            return;
        } else if(this._torpedoes + n > this._capacity) {
            this._torpedoes = this._capacity;
            return;
        }
        this._torpedoes += n;
    }
    getTorpedoCount() {
        return this._torpedoes;
    }
    // fire at sector x y , can be floats or ints
    fire(sectorX, sectorY) {
        if(this.isDamaged()) {
            this.terminal.echo("Photon torpedoes are damaged and can't fire.");
            return;
        }
        if(this._torpedoes <= 0) {
            this.terminal.echo("Not enough torpedoes.");
            return;
        }
        this._torpedoes --;
        // get global x y for target
        let x = this.parent.gameObject.quadrant.x + sectorX;
        let y = this.parent.gameObject.quadrant.y + sectorY;
        // todo::
        // convert this to the x and y that are in the same direction
        // but at the edge of the quadrant
        // let theta = Math.hypot(x,y);


        // make torpedo
        let torpedo = new Torpedo();
        // place torpedo at our current position
        torpedo.gameObject.placeIn(this.parent.gameObject.galaxy,
            this.parent.gameObject.quadrant,
            this.parent.gameObject.sector);

        /// movement test
        // let moveGenerator = torpedo.mover.moveTo(x, y);
        let quadrant = this.parent.gameObject.quadrant;
        let deltaX = x - this.parent.gameObject.x;
        let deltaY = y - this.parent.gameObject.y;
        let theta = Math.atan(deltaY / deltaX);
        let moveGenerator = torpedo.mover.moveInDirection(theta);
        let ret;
        let keepGoing = true;
        let hit = false;
        let thingHit = null;
        do {
            debugger;
            ret = moveGenerator.next(keepGoing);
            // if we've left the quadrant then stop
            if(torpedo.gameObject.quadrant !== quadrant) {
                console.log("We've left the quadrant.", quadrant, torpedo.gameObject.quadrant);
                moveGenerator.next(false);
                break;
            }
            this.terminal.echo(`${torpedo.gameObject.getSectorLocationFloat(false)}    `);
            console.log('torpedo at ', torpedo.gameObject.x, torpedo.gameObject.y);
            // check for collisions, could do a better job of broad sweeping here...
            // get stuff in the torpedo's current sector, and the adjacent ones
            // and nearby sectors
            let sectors = torpedo.gameObject.sector.getAdjacentSectors(true);

            sectors.forEach(sector => {
                if(hit) return;
                sector.container.getAllGameObjects().forEach(obj => {
                    if(hit) return;
                    // check that it's a collider and not the thing firing the torpedo, and it's not the torpedo
                    if(obj.collider && obj !== torpedo && obj !== this.parent) {
                        hit = torpedo.collider.collision(obj);
                        if(hit) {
                            thingHit = obj;
                            console.log("HIT!!!", obj);
                        }
                    }
                });
            })
            if(hit) {
                moveGenerator.next(false);
                break;
            }
        } while (!ret.done);
        this.terminal.echo("\n");
        // we've hit something or left the quadrant
        if(hit) {
            thingHit.collider.takeHit(torpedo.damage);
        } else {
            this.terminal.echo("Torpedo missed and has left the quadrant!");
        }
        torpedo.die();
    }
}