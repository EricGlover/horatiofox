import { GameObjectContainer } from "./Components.js";
//hhmmmmm..... inheritance or composition ?
export class Ship {}

export class Klingon {}

export class Starbase {}

export class Sector {
  constructor(x, y, quadrant) {
    this.container = new GameObjectContainer(this);
    this.quadrant = quadrant;
    // both x and y are 1 based
    this.x = x; // my column # in the galaxy
    this.y = y; // my row # in the galaxy
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
    this.width = width;
    this.length = length;
    this.sectors = [];
    // make sectors
    for (let i = 0; i < this.length; i++) {
      let row = [];
      for (let j = 0; j < this.width; j++) {
        row.push(new Sector(j + 1, i + 1, this));
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

  getNumberOfKlingons() {
    return this.klingons.length;
  }

  getNumberOfStarbases() {
    return this.starbases.length;
  }

  getNumberOfStars() {
    return this.stars.length;
  }

  hasSupernova() {
    return this.hasSupernova;
  }
}

export class Galaxy {
  constructor(width, length, initEmptyQuadrants = false) {
    this.container = new GameObjectContainer(this);
    this.width = width;
    this.length = length;
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
          row[j] = new Quadrant(10, 10, j + 1, i + 1, this);
        }
      }
    }
  }

  getRandomQuadrant() {
    let x = Math.round(Math.random() * (this.width - 1));
    let y = Math.round(Math.random() * (this.length - 1));

    return this.quadrants[y][x];
  }

  getRow(i) {
    return this.quadrants[i];
  }

  getColumn(i) {
    // todo::
  }

  // coordinates are 0 based
  getSector(quadrantX, quadrantY, sectorX, sectorY) {
    return this.getQuadrant(quadrantX, quadrantY).getSector(sectorX, sectorY);
  }

  // coordinates are 0 based
  getQuadrant(quadrantX, quadrantY) {
    // check bounds
    if (quadrantY < 0 || quadrantY > this.length - 1) {
      throw new Error(`There is no quadrant ${x} - ${y}.`);
    }
    if (quadrantX < 0 || quadrantX > this.width - 1) {
      throw new Error(`There is no quadrant ${x} - ${y}.`);
    }
    return this.quadrants[quadrantY][quadrantX];
  }
}
