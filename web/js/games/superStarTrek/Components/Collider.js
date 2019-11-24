// width and height are in units 1/100 * sector width
import {terminal} from "../Terminal.js";
import {DEVICE_DAMAGE_ENABLED} from "../Game.js";
import {Component} from "./Component.js";


// these are treated as collider class variables
let _colliderMaxHitToDamageDevices = 275.0;
let _colliderMinHitToDamageDevices = 50.0;


// can collide into other colliders
// width and length seem to be in terms of 100 / sector (width or length)
export class Collider extends Component {
    constructor(parent, gameObject, width = 0, length = 0, health = 1) {
        super(Collider, parent);
        this.health = health;
        this.maxHealth = this.health;
        this.terminal = terminal;
        this.width = width;
        this.length = length;
        this.gameObject = gameObject;
        this._indestructible = false;
    }

    static get propName() {
        return "collider";
    }

    static setDeviceDamageRange(min, max) {
        _colliderMinHitToDamageDevices = min;
        _colliderMaxHitToDamageDevices = max;
    }

    static get minHitToDamageDevices() {
        return _colliderMinHitToDamageDevices
    }

    static get maxHitToDamageDevices() {
        return _colliderMaxHitToDamageDevices;
    }

    repair() {
        this.health = this.maxHealth;
    }

    makeIndestructible() {
        this._indestructible = true;
    }

    getLeftSideX() {
        return this.gameObject.coordinates.x;
    }

    getRightSideX() {
        return this.gameObject.coordinates.x + (this.width / 100);
    }

    getTopSideY() {
        return this.gameObject.coordinates.y;
    }

    getBottomSideY() {
        return this.gameObject.coordinates.y + (this.length / 100);
    }

    collision(a) {
        if (!a.collider) {
            console.log(a, ' is not a collider.');
            return false;
        }
        return Collider.collision(this, a.collider);
    }

    static collision(a, b) {
        if (!(a instanceof Collider) || !(b instanceof Collider)) {
            console.error('both a and b need to be colliders, ', a, b);
            return false;
        }
        if (a === b) {
            return false;
        }
        // if a left side < b right side
        // and a right side is > b left side
        // and a top side is < b bottom side
        // and a bottom side is > b top side then collision
        if (a.getLeftSideX() < b.getRightSideX()
            && a.getRightSideX() > b.getLeftSideX()
            && a.getTopSideY() < b.getBottomSideY()
            && a.getBottomSideY() > b.getTopSideY()
        ) {
            return true;
        }
        return false;
    }

    //
    hitWillDamageDevices(damage) {
        let threshold = Math.random() * (Collider.maxHitToDamageDevices - Collider.minHitToDamageDevices) + Collider.minHitToDamageDevices;
        console.log('device damage threshold = ', threshold);
        return damage > threshold;
    }

    takeHit(damage) {
        if (this._indestructible) {
            this.terminal.printLine(`Consumed by ${this.gameObject.name} at ${this.gameObject.printSectorLocation()}`);
            return;
        }

        this.health -= damage;
        this.terminal.printLine(`${damage.toFixed(2)} unit hit on ${this.gameObject.name} at ${this.gameObject.printSectorLocation()}`);

        // damage devices
        if (DEVICE_DAMAGE_ENABLED && this.hitWillDamageDevices(damage)) {
            if (this.parent.deviceContainer) {
                // determine amount of damage (for moment just the original damage)
                let deviceDamage = damage / (75.0 * (25 * Math.random()));
                this.parent.deviceContainer.damageRandomDevices(deviceDamage);
            }
        }

        if (this.health <= 0) {
            if (this.parent.die) {
                this.parent.die();
            } else {
                this.terminal.echo(`${this.gameObject.name} destroyed.`);
            }
        }
    }
}