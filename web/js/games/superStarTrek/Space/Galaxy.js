import {GameObjectContainer} from "../Components.js";
import {Quadrant} from "./Quadrant";
import {Coordinates} from "./Coordinates";

/**
 Coordinate System
 Both internal and external are x then y (x - y)
 Quadrant is specified first or omitted, then the sector in that quadrant
 Users interact with a 1 based system with centered sectors
 so 1 - 1, 1 - 1 refers to the top left quadrant and the top left sector in it, the dead center of that sector
 1 - 1, .5 - .5 refers to the same quadrant and sector but the top left corner of it

 Internally is basically the same but sectors are considered to start at the top left point
 and it's 0 based
 so 0 - 0, 0 - 0 refers to the top left quadrant and the top left sector in it at the top left corner of that sector
 and 0 - 0, 0.5 - 0.5 refers to the same quadrant and sector but the dead center of it
 **/


// do quadrant know what's in them ?

/**
 * Holds quadrants
 * Has some spatial logic
 */
export class Galaxy {
    constructor(width, length, quadrantWidth = 10, quadrantLength = 10, initEmptyQuadrants = true) {
        this.container = new GameObjectContainer(this);
        this.width = width; // number of columns of quadrants
        this.length = length;   // number of rows of quadrants
        this.quadrantWidth = quadrantWidth; // number of columns of sectors in each quadrant
        this.quadrantLength = quadrantLength;   // number of rows of sectors in each quadrant
        // setup our grid
        this.quadrants = [];
        for (let i = 0; i < length; i++) {
            this.quadrants.push(new Array(width));
        }
        // make quadrants
        if (initEmptyQuadrants) {
            for (let i = 0; i < this.quadrants.length; i++) {
                let row = this.quadrants[i];
                for (let j = 0; j < row.length; j++) {
                    let c = new Coordinates(this, j * this.quadrantWidth, i * this.quadrantLength);
                    row[j] = new Quadrant(this.quadrantWidth, this.quadrantLength, c, this, j, i);
                }
            }
        }
    }

    getRandomQuadrant() {
        let x = Math.round(Math.random() * (this.width - 1));
        let y = Math.round(Math.random() * (this.length - 1));

        return this._getQuadrant(x, y);
    }

    // i is 0 based
    getRow(i) {
        return this.quadrants[i];
    }

    getAllQuadrants() {
        return this.quadrants.flat();
    }

    getSector(coordinates) {
        if (!this.areValidCoordinates(coordinates)) {
            throw new Error("invalid coordinates");
        }
        let {qX, qY, sX, sY} = this._convertCoordinates(coordinates);
        return this._getSector(qX, qY, sX, sY);
    }

    getQuadrant(coordinates) {
        let {qX, qY} = this._convertCoordinates(coordinates);
        if (!this._areValidCoordinates(qX, qY)) {
            throw new Error("invalid coordinates");
        }

        return this._getQuadrant(qX, qY);
    }

    _convertCoordinates(c) {
        return {
            qX: Math.floor(c.x / this.quadrantWidth),
            qY: Math.floor(c.y / this.quadrantLength),
            sX: Math.floor(c.x % this.quadrantWidth),
            sY: Math.floor(c.y % this.quadrantLength)
        }
    }

    // coordinates are 0 based
    _getSector(quadrantX, quadrantY, sectorX, sectorY) {
        let q = this._getQuadrant(quadrantX, quadrantY);
        if (!q._areValidCoordinates(sectorX, sectorY)) {
            throw new Error("invalid coordinates");
        }
        return q._getSector(sectorX, sectorY);
    }

    // coordinates are 0 based
    _getQuadrant(x, y) {
        return this.quadrants[y][x];
    }

    // coordinates are 0 based
    _areValidCoordinates(quadrantX, quadrantY) {
        return quadrantY >= 0 && quadrantY < this.length && quadrantX >= 0 && quadrantX < this.width;
    }

    areValidCoordinates(c) {
        let {qX, qY, sX, sY} = this._convertCoordinates(c);

        if (!this._areValidCoordinates(qX, qY)) {
            return false;
        }
        let q = this._getQuadrant(qX, qY);
        return q._areValidCoordinates(sX, sY);
    }

    // return positive int value
    static calculateDistance(sectorA, sectorB) {
        return sectorA.topLeft.distanceTo(sectorB.topLeft);
    }

    // convert user global coordinates
    static convertUserCoordinates(x, y) {
        return {x: x - .5, y: y - .5};
    }

    getQuadrantsAdjacencyMatrix(quadrant) {
        if (!quadrant instanceof Quadrant) return [];
        let quadrantX = quadrant._x;
        let quadrantY = quadrant._y;
        let matrix = [];
        for (let y = quadrantY - 1; y <= quadrantY + 1; y++) {
            let row = [];
            for (let x = quadrantX - 1; x <= quadrantX + 1; x++) {
                if (this._areValidCoordinates(x, y)) {
                    row.push(this.quadrants[y][x]);
                } else {
                    row.push(null);
                }
            }
            matrix.push(row);
        }
        return matrix;
    }

    //
    // internal coordinates x y
    getQuadrantsAdjacentTo(quadrant, includeSelf = false) {
        if (!quadrant instanceof Quadrant) return [];
        let quadrantX = quadrant._x;
        let quadrantY = quadrant._y;
        let quadrants = [];
        for (let y = quadrantY - 1; y <= quadrantY + 1; y++) {
            for (let x = quadrantX - 1; x <= quadrantX + 1; x++) {
                if (this._areValidCoordinates(x, y)) {
                    if (includeSelf || x !== quadrantX && y !== quadrantY) {
                        quadrants.push(this.quadrants[y][x]);
                    }
                }
            }
        }
        return quadrants;
    }
}

window.Galaxy = Galaxy;