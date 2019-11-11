import {GameObjectContainer} from "./Components.js";

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


export class Sector {
    constructor(x, y, quadrant) {
        this.container = new GameObjectContainer(this);
        this.quadrant = quadrant;
        this.galaxy = quadrant.galaxy;
        // both x and y are 1 based
        this.x = x; // my column # in the galaxy
        this.y = y; // my row # in the galaxy
        let coordinates = this.galaxy.getGlobalCoordinates(this);
        this.globalX = coordinates.x;
        this.globalY = coordinates.y;
    }

    getAdjacentSectors(includeSelf = false) {
        return this.quadrant.getSectorsAdjacentTo(this, includeSelf);
    }

    // game object that take up the whole sector
    // fill up the whole sector (Planets, Bases, Stars, BlackHoles, Ships, etc..)
    isFull() {
        return this.container.getAllGameObjects().some(obj => obj.gameObject.takesWholeSector);
    }
}

// do quadrant know what's in them ?
// or do what's in them know where they are ?
export class Quadrant {
    constructor(width, length, x, y, galaxy) {
        this.container = new GameObjectContainer(this);
        // todo:: setup number of stars per quadrant
        this.galaxy = galaxy;
        // both x and y are 1 based
        this.x = x; // my column # in the galaxy
        this.y = y; // my row # in the galaxy
        // global coordinates
        let coordinates = this.galaxy.getGlobalCoordinatesForQuadrant(this);
        this.globalX = coordinates.x;
        this.globalY = coordinates.y;
        this.width = width;
        this.length = length;
        this.sectors = [];
        this.hasSupernova = false;
        // make sectors
        for (let i = 0; i < this.length; i++) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(new Sector(j, i, this));
            }
            this.sectors.push(row);
        }
    }

    // internal coordinates x y
    getSectorsAdjacentTo(sector, includeSelf = false) {
        if (!sector instanceof Sector) return [];
        let sectorX = sector.x;
        let sectorY = sector.y;
        let sectors = [];
        for (let y = sectorY - 1; y <= sectorY + 1; y++) {
            for (let x = sectorX - 1; x <= sectorX + 1; x++) {
                if (this.areValidCoordinates(x, y)) {
                    if (includeSelf || x !== sectorX && y !== sectorY) {
                        sectors.push(this.sectors[y][x]);
                    }
                }
            }
        }
        return sectors;
    }

    getNearestEmptySectorAdjacentTo(sector) {
        if (!sector instanceof Sector) return;
        let sectorX = sector.x;
        let sectorY = sector.y;

        // a cache of previously
        let prevMatrix = [];
        for (let i = 0; i < this.length; i++) {
            let row = new Array(this.width);
            row.fill(false, 0);
            prevMatrix.push(row);
        }
        prevMatrix[sectorY][sectorX] = true;
        let totalChecked = 1;
        let distanceFromStart = 1;
        while (totalChecked < this.width * this.length) {
            for (let y = sectorY - distanceFromStart; y <= sectorY + distanceFromStart; y++) {
                if(!prevMatrix[y]) continue;    // invalid coordinates
                for (let x = sectorX - distanceFromStart; x <= sectorX + distanceFromStart; x++) {
                    // check cache
                    if(prevMatrix[y][x]) {
                        continue;
                    }
                    // check that coordinates are valid
                    if (this.areValidCoordinates(x, y)) {
                        let sector = this.getSector(x, y);
                        if(!sector.isFull()) {
                            return sector;
                        }
                        prevMatrix[y][x] = true;
                        totalChecked++;
                    }
                }
            }
            distanceFromStart++;
        }
        return null;
    }

    areValidCoordinates(x, y) {
        if (y < 0 || y > this.length - 1) {
            return false;
        }
        if (x < 0 || x > this.width - 1) {
            return false;
        }
        return true;
    }

    getRandomSector() {
        let x = Math.round(Math.random() * (this.width - 1));
        let y = Math.round(Math.random() * (this.length - 1));
        return this.sectors[y][x];
    }

    // x and y may be floats
    // internal coordinates
    getSector(x, y) {
        if (!this.areValidCoordinates(x, y)) {
            throw new Error(`There is no sector ${x} - ${y}.`);
        }
        x = Math.trunc(x);
        y = Math.trunc(y);
        return this.sectors[y][x];
    }

    // is there something in every sector ?
    isFull() {
        if (this.hasSupernova) {
            return true;
        }
        return this.sectors.every(row => {
            return row.every(sector => !sector.container.isEmpty())
        });
    }

    getRandomEmptySector() {
        // get all the empty sectors then randomly choose one
        let emptySectors = this.sectors
            .map(sectors => {
                return sectors.filter(sector => sector.container.isEmpty());
            })
            .flat();
        if (emptySectors.length === 0) return;
        let idx = Math.round(Math.random() * (emptySectors.length - 1));
        return emptySectors[idx];
    }

    getEdge(startX, startY, angle) {

        return {
            x: 0,
            y: 0
        }
    }
}

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
                    row[j] = new Quadrant(this.quadrantWidth, this.quadrantLength, j, i, this);
                }
            }
        }
    }

    // return positive int value
    static calculateDistance(sectorA, sectorB) {
        let deltaX = Math.abs(sectorA.globalX - sectorB.globalX);
        let deltaY = Math.abs(sectorA.globalY - sectorB.globalY);
        return Math.hypot(deltaX, deltaY);
    }

    // convert user global coordinates
    static convertUserCoordinates(x, y) {
        return {x: x - .5, y: y - .5};
    }

    getRandomQuadrant() {
        let x = Math.round(Math.random() * (this.width - 1));
        let y = Math.round(Math.random() * (this.length - 1));

        return this.quadrants[y][x];
    }

    // i is 0 based
    getRow(i) {
        return this.quadrants[i];
    }

    // calculate globalX and globalY
    // refers to the top left point of the sector
    getGlobalCoordinates(sector) {
        let x = sector.quadrant.x * this.quadrantWidth + sector.x;
        let y = sector.quadrant.y * this.quadrantLength + sector.y;
        return {x, y};
    }

    // calculate globalX and globalY
    // refers to the top left point of the sector
    getGlobalCoordinatesForQuadrant(quadrant) {
        let x = quadrant.x * this.quadrantWidth;
        let y = quadrant.y * this.quadrantLength;
        return {x, y};
    }

    // using global coordinates
    // x and y can be floats
    getSectorGlobal(x, y) {
        let quadrantX = Math.floor(x / this.quadrantWidth);
        let quadrantY = Math.floor(y / this.quadrantLength);
        let sectorX = Math.floor(x % this.quadrantWidth);
        let sectorY = Math.floor(y % this.quadrantLength);
        return this.getSector(quadrantX, quadrantY, sectorX, sectorY);
    }

    // coordinates are 0 based
    getSector(quadrantX, quadrantY, sectorX, sectorY) {
        return this.getQuadrant(quadrantX, quadrantY).getSector(sectorX, sectorY);
    }

    // coordinates are 0 based
    getQuadrant(quadrantX, quadrantY) {
        // check bounds
        if (quadrantY < 0 || quadrantY > this.length - 1) {
            throw new Error(`There is no quadrant ${quadrantX + 1} - ${quadrantY + 1}.`);
        }
        if (quadrantX < 0 || quadrantX > this.width - 1) {
            throw new Error(`There is no quadrant ${quadrantX + 1} - ${quadrantY + 1}.`);
        }
        return this.quadrants[quadrantY][quadrantX];
    }
}

window.Galaxy = Galaxy;