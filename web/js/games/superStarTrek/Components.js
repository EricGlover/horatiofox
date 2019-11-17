// game objects and containers work together
// is something that can contain game objects
import {terminal} from "./Terminal.js";
import {DEVICE_DAMAGE_ENABLED} from "./Game.js";
import {Coordinates, Vector} from "./Space/Coordinates";

// these are treated as collider class variables
let _colliderMaxHitToDamageDevices = 275.0;
let _colliderMinHitToDamageDevices = 50.0;

/**
 * Our base component class
 * All components appear on their parents on the same prop name
 * for a given kind of component (ex : all phasers are on .phasers)
 * all components can access their parent
 */
export class Component {
    constructor(_class, parent) {
        if (!_class.propName || typeof _class.propName === 'function') {
            debugger;
            throw new Error("To inherit component you need to define a static propName");
        }
        this.parent = parent;
        this.parent[_class.propName] = this;
        this.parent.hasComponent = Component.hasComponent.bind(this.parent);
    }

    static hasComponent(_class) {
        return this[_class.propName];
    }
}


// can collide into other colliders
// width and height are in units 1/100 * sector width
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
        if (!a.collider) {
            console.log(a, ' is not a collider.');
            return false;
        }
        return Collider.collision(this, a.collider);
    }

    static collision(a, b) {
        if (!a instanceof Collider || !b instanceof Collider) {
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
            this.terminal.printLine(`Consumed by ${this.gameObject.name} at ${this.gameObject.getSectorLocation()}`)
            return;
        }

        this.health -= damage;
        this.terminal.printLine(`${damage.toFixed(2)} unit hit on ${this.gameObject.name} at ${this.gameObject.getSectorLocation()}`)

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

// things that can move
export class Mover extends Component {
    constructor(parent, gameObject) {
        super(Mover, parent);
        this.gameObject = gameObject;
    }

    static get propName() {
        return "mover";
    }

    calculateDirectionTo(globalX, globalY) {
        // let deltaX = globalX - this.gameObject./// calculate the direction to shoot the torpedo
        //     // let
        // quadrant = this.parent.gameObject.quadrant;
        // // deltas are to - from, BUT because the y axis is inverted from
        // // the normal math y axis you'll need to flip the y
        // let deltaX = x - this.parent.gameObject.x;
        // let deltaY = -1 * (y - this.parent.gameObject.y);
        // let theta = Math.atan2(deltaY, deltaX);    // -PI , PI
    }

    calculateDestination(deltaQx = 0, deltaQy = 0, deltaSx = 0, deltaSy = 0) {
        let move = Vector.make1(deltaQx, deltaQy, deltaSx, deltaSy);
        return this.gameObject.coordinates.addVector(move);
        // let sector = this.gameObject.sector;
        // let deltaX = Coordinates.calculateDistanceX(deltaQx, deltaSx);
        // let deltaY = Coordinates.calculateDistanceY(deltaQy, deltaSy);
        // let destination = sector.center.add(deltaX, deltaY);
        // return this.gameObject.galaxy.getSector(destination);
    }

    calculateTime(distance, warpFactor) {
        return distance / Math.pow(warpFactor, 2);
    }

    calculateDistance(time, warpFactor) {
        return Math.pow(warpFactor, 2) * time;
    }

    calculateWarpFactor(time, distance) {
        return Math.sqrt(distance / time);
    }

    // @returns float
    static calculateDistance(x1, y1, x2, y2) {
        let deltaX = Math.abs(x2 - x1);
        let deltaY = Math.abs(y2 - y1);
        return Math.hypot(deltaX, deltaY);
    }

    // theta is our direction, delta is our distance per move
    * moveInDirection(theta, delta = .5, dist) {
        // find deltaX and deltaY (amount to move each move)
        // this finds the x and y of the right triangle using delta as hypotenuse
        let deltaX = delta * Math.cos(theta);
        let deltaY = -1 * (delta * Math.sin(theta));  // y axis is inverted
        let i = 0;  // failsafe
        let keepGoing = true;
        while (keepGoing) {
            if (i > 1000) return;
            // todo:: check bounds
            this.gameObject.x += deltaX;
            this.gameObject.y += deltaY;
            this.gameObject.updateCoordinates();
            keepGoing = yield;
            i++;
        }
        return;
    }

    // delta = max amount to move per move
    * moveTo(globalX, globalY, delta = .5) {
        debugger;
        // find total distance
        // let distance = Mover.calculateDistance(this.gameObject.x, this.gameObject.y, globalX, globalY);
        let remaining = distance;
        // total x and y
        // let distanceX = Math.abs(this.gameObject.x - globalX);
        // let distanceY = Math.abs(this.gameObject.y - globalY);
        // angle  // todo:: check this later
        let theta = Math.atan2(this.gameObject.y - globalY / this.gameObject.x - globalX);
        // find deltaX and deltaY (amount to move each move)
        // this finds the x and y of the right triangle using delta as hypotenuse
        let deltaX = delta * Math.cos(theta);
        let deltaY = delta * Math.sin(theta);

        let keepGoing = true;
        while (remaining > 0 && keepGoing) {
            // todo:: check bounds
            // move by deltax deltay, or the remaining distance (whichever is less)
            let remainingX = Math.abs(globalX - this.gameObject.x);
            let remainingY = Math.abs(globalY - this.gameObject.y);
            // don't overshoot the landing
            if (remainingX < deltaX) {
                deltaX = globalX - this.gameObject.x;
            }
            if (remainingY < deltaY) {
                deltaY = globalY - this.gameObject.y;
            }
            this.gameObject.x += deltaX;
            this.gameObject.y += deltaY;
            this.gameObject.updateCoordinates();
            remaining -= delta; // technically incorrect if deltas modified but whatever
            if (remaining <= 0) {
                return;
            }
            keepGoing = yield;
        }
        return;
    }

    // only basic collision detection
    // drops the object into the sector
    moveToSector(sector) {
        // collision detection
        if (sector.isFull()) {
            debugger;
        }
        this.gameObject.sector.container.removeGameObject(this.parent);
        this.gameObject.quadrant.container.removeGameObject(this.parent);
        this.gameObject.placeIn(this.gameObject.galaxy, sector.quadrant, sector);
    }
}

// a thing that holds game objects
export class GameObjectContainer extends Component {
    constructor(parent) {
        super(GameObjectContainer, parent);
        this.gameObjects = [];
    }

    static get propName() {
        return "container";
    }

    isEmpty() {
        return this.gameObjects.length === 0;
    }

    getCountOfGameObjects(type) {
        return this.gameObjects.reduce((count, object) => {
            if (object instanceof type) count++;
            return count;
        }, 0);
    }

    getGameObjectsOfType(type) {
        return this.gameObjects.filter(object => object instanceof type);
    }

    getAllGameObjects() {
        return this.gameObjects.slice();
    }

    addGameObject(obj) {
        this.gameObjects.push(obj);
    }

    removeGameObject(obj) {
        this.gameObjects = this.gameObjects.filter(o => o !== obj);
    }
}

// a game object is simply a thing with a position in
// the game
export class GameObject extends Component {
    constructor(parent, takesWholeSector = false, galaxy = null) {
        super(GameObject, parent);
        this.galaxy = galaxy;
        this.quadrant = null;
        this.sector = null;
        this.coordinates = new Coordinates();
        this.takesWholeSector = takesWholeSector;
    }

    static get propName() {
        return "gameObject";
    }

    // if something was removed from the game...
    isInGame() {
        if (!this.galaxy || !this.quadrant || !this.sector) {
            return false;
        }
        return true;
    }

    get name() {
        if (this.parent.name) {
            return this.parent.name;
        } else {
            return this.parent.constructor.name;
        }
    }

    removeSelf() {
        this.galaxy.container.removeGameObject(this.parent);
        this.quadrant.container.removeGameObject(this.parent);
        this.sector.container.removeGameObject(this.parent);
        this.galaxy = null;
        this.quadrant = null;
        this.sector = null;
        this.coordinates = null;
    }

    // update our containers
    updateCoordinates() {
        try {
            let currentSector = this.galaxy.getSector(this.coordinates);
            if (currentSector !== this.sector) {
                if (!this.canMoveTo(currentSector)) {
                    throw new Error("Cant place object in non empty sector");
                }
                this.quadrant.container.removeGameObject(this.parent);
                this.sector.container.removeGameObject(this.parent);
                this.quadrant = currentSector.quadrant;
                this.sector = currentSector;
            }
        } catch (e) {
            // left galaxy
            this.removeSelf();
        }
    }

    // check that sector is empty
    canMoveTo(sector) {
        if (this.takesWholeSector && !sector.container.isEmpty()) {
            return false;
        }
        return true;
    }

    // the x and y in the sector 0 - 0 is top left
    placeIn(galaxy, quadrant, sector) {
        if (!this.canMoveTo(sector)) {
            throw new Error("Cant place object in non empty sector");
        }
        if (!sector) {
            debugger;
        }
        this.galaxy = galaxy;
        this.quadrant = quadrant;
        this.sector = sector;
        this.galaxy.container.addGameObject(this.parent);
        this.quadrant.container.addGameObject(this.parent);
        this.sector.container.addGameObject(this.parent);
        this.coordinates = sector.center.clone();
    }

    getSectorLocationFloat(includeSector = true) {
        // todo::
        let x = ((this.x % this.quadrant.width) + .5).toFixed(1);
        let y = ((this.y % this.quadrant.width) + .5).toFixed(1);
        return `${includeSector ? 'Sector ' : ''}${x} - ${y}`
    }

    printLocation() {
        return `${this.printQuadrantLocation()}; ${this.printSectorLocation()}`;
    }

    // functions for printing out our location to the user
    printSectorLocation(includeSector = true) {
        return `${includeSector ? 'Sector ' : ''}${this.coordinates.userSectorX} - ${this.coordinates.userSectorY}`;
    }

    printQuadrantLocation() {
        return `Quadrant ${this.coordinates.userQuadrantX} - ${this.coordinates.userQuadrantY}`;
    }

    getLocation() {
        return {
            qX: this.coordinates.userQuadrantX,
            qY: this.coordinates.userQuadrantY,
            sX: this.coordinates.userSectorX,
            sY: this.coordinates.userSectorY
        }
    }
}
