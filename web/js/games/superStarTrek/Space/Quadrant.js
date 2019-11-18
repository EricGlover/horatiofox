// or do what's in them know where they are ?
import {Sector} from "./Sector.js";
import {GameObjectContainer} from "../Components/GameObject.js";

export class Quadrant {
    constructor(width, length, topLeftCoordinates, galaxy, x, y) {
        this.container = new GameObjectContainer(this);
        // todo:: setup number of stars per quadrant
        this.galaxy = galaxy;
        this.width = width;
        this.length = length;
        this._x = x;    // place in galaxy
        this._y = y;    // place in galaxy
        this.topLeft = topLeftCoordinates;
        this.topRight = topLeftCoordinates.add(this.width);
        this.bottomLeft = topLeftCoordinates.add(0, this.length);
        this.bottomRight = topLeftCoordinates.add(this.width, this.length);
        this.center = topLeftCoordinates.add(this.width / 2, this.length / 2);
        this.sectors = [];
        this.hasSupernova = false;
        // make sectors
        for (let i = 0; i < this.length; i++) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                let c = this.topLeft.add(j, i);
                row.push(new Sector(this, c, j, i));
            }
            this.sectors.push(row);
        }
    }

    getSectorsAdjacentTo(sector, includeSelf = false, includeDiagonals = false) {
        if (!sector instanceof Sector) return [];
        let sectorX = sector._x;
        let sectorY = sector._y;
        let sectors = [];

        for (let y = sectorY - 1; y <= sectorY + 1; y++) {
            for (let x = sectorX - 1; x <= sectorX + 1; x++) {
                let n = sectorX + sectorY;
                let n2 = x + y;
                let distance = Math.abs(n2 - n);
                if (!includeDiagonals && distance > 1) continue;
                if (this._areValidCoordinates(x, y)) {
                    if (includeSelf || distance > 0) {
                        sectors.push(this._getSector(x, y));
                    }
                }
            }
        }
        return sectors;
    }

    getNearestEmptySectorAdjacentTo(sector) {
        if (!sector instanceof Sector) return;
        let sectorX = sector._x;
        let sectorY = sector._y;

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
                if (!prevMatrix[y]) continue;    // invalid coordinates
                for (let x = sectorX - distanceFromStart; x <= sectorX + distanceFromStart; x++) {
                    // check cache
                    if (prevMatrix[y][x]) {
                        continue;
                    }
                    // check that coordinates are valid
                    if (this._areValidCoordinates(x, y)) {
                        let sector = this._getSector(x, y);
                        if (!sector.isFull()) {
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

    _areValidCoordinates(x, y) {
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
        return this._getSector(x, y);
    }

    supernova() {
        this.container.killAll();
        this.hasSupernova = true;
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

    _getSector(x, y) {
        return this.sectors[y][x];
    }
}