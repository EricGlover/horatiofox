import { GameObjectContainer } from "./Components.js";

export class Sector {
  constructor(x, y, quadrant) {
    this.container = new GameObjectContainer(this);
    this.quadrant = quadrant;
    this.galaxy = quadrant.galaxy;
    // both x and y are 0 based
    this.x = x; // my column # in the galaxy
    this.y = y; // my row # in the galaxy
    let coordinates = this.galaxy.getGlobalCoordinates(this);
    this.globalX = coordinates.x;
    this.globalY = coordinates.y;
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
    // both x and y are 0 based
    this.x = x; // my column # in the galaxy
    this.y = y; // my row # in the galaxy
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

  getRandomSector() {
    let x = Math.round(Math.random() * (this.width - 1));
    let y = Math.round(Math.random() * (this.length - 1));
    return this.sectors[y][x];
  }

  getSector(x, y) {
    if (y < 0 || y > this.length - 1) {
      throw new Error(`There is no sector ${x} - ${y}.`);
    }
    if (x < 0 || x > this.width - 1) {
      throw new Error(`There is no sector ${x} - ${y}.`);
    }
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
}

export class Galaxy {
  constructor(width, length, quadrantWidth = 10, quadrantLength = 10, initEmptyQuadrants = true) {
    this.container = new GameObjectContainer(this);
    this.width = width;
    this.length = length;
    this.quadrantWidth = quadrantWidth;
    this.quadrantLength = quadrantLength;
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

  // returns B's displacement from A, given in X, Y
  static calculateDisplacement(sectorA, sectorB) {
    debugger;
    return {
      x: 0,
      y: 0
    }
  }

  // return positive int value
  static calculateDistance(sectorA, sectorB) {
    let deltaX = Math.abs(sectorA.globalX - sectorB.globalX);
    let deltaY = Math.abs(sectorA.globalY - sectorB.globalY);
    return Math.hypot(deltaX, deltaY);
  }

  getRandomQuadrant() {
    let x = Math.round(Math.random() * (this.width - 1));
    let y = Math.round(Math.random() * (this.length - 1));

    return this.quadrants[y][x];
  }

  getRow(i) {
    return this.quadrants[i];
  }

  // calculate globalX and globalY
  // refers to the top left point of the sector
  getGlobalCoordinates(sector) {
    let x = sector.quadrant.x * this.quadrantWidth + sector.x;
    let y = sector.quadrant.y * this.quadrantLength + sector.y;
    return {x,y};
  }

  // using global coordinates
  getSectorGlobal(x, y) {
    let quadrantX = Math.floor(x / this.quadrantWidth);
    let quadrantY = Math.floor(y / this.quadrantLength);
    let sectorX = x % this.quadrantWidth;
    let sectorY = y % this.quadrantLength;
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
      throw new Error(`There is no quadrant ${quadrantX} - ${quadrantY}.`);
    }
    if (quadrantX < 0 || quadrantX > this.width - 1) {
      throw new Error(`There is no quadrant ${quadrantX} - ${quadrantY}.`);
    }
    return this.quadrants[quadrantY][quadrantX];
  }
}
window.Galaxy = Galaxy;