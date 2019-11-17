export class Vector {
    constructor(distance, theta) {
        this._distance = distance;
        this._angle = theta;
        this._deltaX = Math.cos(this._angle) * this._distance;
        this._deltaY = Math.sin(this._angle) * this._distance;
    }

    scale(newDistance) {
        return new Vector(newDistance, this._angle);
    }

    get distance() {
        return this._distance;
    }

    get angle() {
        return this._angle;
    }

    get angleDegrees() {
        return Vector.toDegrees(this.angle);
    }

    get deltaX() {
        return this._deltaX;
    }

    get deltaY() {
        return this._deltaY;
    }
    static calcAngleDegrees(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    }
    static toDegrees(rad) {
        return rad * 180 / Math.PI;
    }

    // todo:::::::
    static make(deltaX, deltaY) {
        let d = Math.hypot(deltaX, deltaY);
        let theta = Math.atan2(deltaY, deltaX);
        console.log(theta);
        console.log(Vector.toDegrees(theta));
        debugger;
        return new Vector(d, theta);
    }
    static make1(deltaQx, deltaQy, deltaSx, deltaSy, galaxy) {
        let deltaX = Coordinates.calculateDistanceX(deltaQx, deltaSx, galaxy);
        let deltaY = -1 * Coordinates.calculateDistanceY(deltaQy, deltaSy, galaxy);
        return Vector.make(deltaX, deltaY);
    }
}


/**
 * Handles all the coordinate system logic
 * Like internal coordinates vs external
 * Works with Galaxy
 */
export class Coordinates {
    constructor(galaxy, globalX = null, globalY = null) {
        this._x = globalX;  // in terms of sectors : float
        this._y = globalY;  // in terms of sectors : float
        this._galaxy = galaxy;
        this._dirty = true;

        this._userSectorX = null;
        this._userSectorY = null;
        this._userQuadrantX = null;
        this._userQuadrantY = null;
        this._userSectorXFloat = null;
        this._userSectorYFloat = null;
    }

    static calculateDistanceX(deltaQ, deltaS, galaxy) {
        return deltaQ * galaxy.quadrantWidth + deltaS;
    }

    static calculateDistanceY(deltaQ, deltaS, galaxy) {
        return deltaQ * galaxy.quadrantLength + deltaS;
    }

    // make coordinates from user coordinates
    // user coordinates are 1 based and centered
    // could be floats ???
    static convert(quadX, quadY, sectorX, sectorY, galaxy) {
        quadX--;
        quadY--;
        sectorX--;
        sectorY--;
        let x = Coordinates.calculateDistanceX(quadX, sectorX, galaxy);
        let y = Coordinates.calculateDistanceY(quadY, sectorY, galaxy);
        return new Coordinates(galaxy, x, y);
    }

    // make coordinates from user coordinates
    // user coordinates are 1 based and centered
    // could be floats ???
    static convert1(quadrant, sectorX, sectorY) {
        sectorX--;
        sectorY--;
        return quadrant.topLeft.add(sectorX, sectorY);
    }

    add(x, y) {
        return new Coordinates(this._galaxy, this.x + x, this.y + y);
    }

    addVector(v) {
        return new Coordinates(this._galaxy, this.x + v.deltaX, this.y + v.deltaY)
    }

    distanceTo(c) {
        if (!(c instanceof Coordinates)) {
            throw new Error("not coordinates");
        }
        let deltaX = Math.abs(this.x - c.x);
        let deltaY = Math.abs(this.y - c.y);
        return Math.hypot(deltaX, deltaY);
    }

    angleTo(c) {
        if (!(c instanceof Coordinates)) {
            throw new Error("not coordinates");
        }
        return Math.atan2(c.y - this.y, c.x - this.x);
    }

    getVectorTo(c) {
        if (!(c instanceof Coordinates)) {
            throw new Error("not coordinates");
        }
        let deltaX = c.x - this.x;
        let deltaY = c.y - this.y;
        return Vector.make(deltaX, deltaY);
    }

    get x() {
        return this._x;
    }

    set x(val) {
        this._dirty = true;
        this._x = val;
    }

    get y() {
        return this._y;
    }

    set y(val) {
        this._dirty = true;
        this._y = val;
    }

    get userSectorXFloat() {
        if (this._dirty) this.update();
        return this._userSectorXFloat;
    }

    get userSectorYFloat() {
        if (this._dirty) this.update();
        return this._userSectorYFloat;
    }

    get userSectorX() {
        if (this._dirty) this.update();
        return this._userSectorX;
    }

    get userSectorY() {
        if (this._dirty) this.update();
        return this._userSectorY;
    }

    get userQuadrantX() {
        if (this._dirty) this.update();
        return this._userQuadrantX;
    }

    get userQuadrantY() {
        if (this._dirty) this.update();
        return this._userQuadrantY;
    }

    // update all the computed values after something modified x or y
    update() {
        let qX = Math.floor(this.x / this._galaxy.quadrantWidth);
        let qY = Math.floor(this.y / this._galaxy.quadrantLength);
        let sX = this.x % this._galaxy.quadrantWidth;
        let sY = this.y % this._galaxy.quadrantLength;
        // quadrant 0 0, topLeft point is x = 0; y = 0
        // users see this quadrant as 1 - 1
        this._userQuadrantX = qX + 1;
        this._userQuadrantY = qY + 1;
        // sector 0 0, have five points corners and center but users
        // will always refer to the center , so for them this same sector
        // topLeft x = .5, y = .5; center x = 1 y = 1; bottom right x = 1.5 1.5
        // sector 0 0, points 1 > x >= 0, 1 > y >= 0 should show the user 1 1
        // for the int, and 1.5 > x > .5, 1.5 > y >= .5 for the float
        this._userSectorX = Math.round(sX + .5);
        this._userSectorY = Math.round(sY + .5);
        this._userSectorXFloat = sX + .5;
        this._userSectorYFloat = sY + .5;
        this._dirty = false;
    }

    copy(c) {
        if (!(c instanceof Coordinates)) {
            throw new Error("not coordinates");
        }
        this.x = c.x;
        this.y = c.y;
    }

    clone() {
        return new Coordinates(this._galaxy, this.x, this.y);
    }

    static get propName() {
        return 'coordinates';
    }
}