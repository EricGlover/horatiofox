export class Vector {
    constructor(distance, theta) {
        this._distance = distance;
        this._angle = theta;
        this._deltaX = Math.sin(this._angle) * this._distance;
        this._deltaY = Math.cos(this._angle) * this._distance;
    }
    static make(deltaX, deltaY) {
        let d = Math.hypot(deltaX, deltaY);
        let theta = Math.atan2(deltaY, deltaX)
        return new Vector(d, theta);
    }
    static make1(deltaQx, deltaQy, deltaSx, deltaSy) {
        let deltaX = Coordinates.calculateDistanceX(deltaQx, deltaSx);
        let deltaY = Coordinates.calculateDistanceY(deltaQy, deltaSy);
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
        return new Coordinates(this._galaxy, this.x + v._deltaX, this.y + v._deltaY)
    }

    distanceTo(c) {
        if (!(c instanceof Coordinates)) {
            throw new Error("not coordinates");
        }
        let deltaX = Math.abs(this.x - c.x);
        let deltaY = Math.abs(this.y - c.y);
        return Math.hypot(deltaX, deltaY);
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

    update() {
        let {qX, qY, sX, sY} = this._galaxy._convertCoordinates(this);
        this._userQuadrantX = qX + 1;
        this._userQuadrantY = qY + 1;
        this._userSectorX = sX + 1;
        this._userSectorY = sY + 1;
    }

    clone() {
        return new Coordinates(this._galaxy, this.x, this.y);
    }

    static get propName() {
        return 'coordinates';
    }
}