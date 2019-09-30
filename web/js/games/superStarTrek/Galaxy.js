//hhmmmmm..... inheritance or composition ?
export class Ship {}

export class Klingon {}

export class Star {
  constructor(gameObject) {
    this.gameObject = gameObject;
  }
  getGalaxy() {}
  getQuadrant() {}
  getSector() {}
}

export class Starbase {}

// position component
export class GameObject {}

// movable component
export class MoveableGameObject {
  constructor(gameObject) {}
}

export class Sector {
  constructor(x, y, quadrant) {
    this.quadrant = quadrant;
    // both x and y are 1 based
    this.x = x; // my column # in the galaxy
    this.y = y; // my row # in the galaxy
  }

  addGameObject(object) {}
}

// do quadrant know what's in them ?
// or do what's in them know where they are ?
export class Quadrant {
  constructor(width, length, x, y, galaxy) {
    // todo:: setup number of stars per quadrant
    this.galaxy = galaxy;
    // both x and y are 1 based
    this.x = x; // my column # in the galaxy
    this.y = y; // my row # in the galaxy
    this.width = width;
    this.length = length;
    this.hasSupernova = false;
    this.klingons = [];
    this.starbases = [];
    this.stars = [];
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

  addGameObject(object, sector) {}

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
    this.width = width;
    this.length = length;
    // setup our grid
    this.quandrants = [];
    for (let i = 0; i < length; i++) {
      this.quandrants.push(new Array(width));
    }
    // make quadrants
    if (initEmptyQuadrants) {
      for (let i = 0; i < this.quandrants.length; i++) {
        let row = this.quandrants[i];
        for (let j = 0; j < row.length; j++) {
          row[j] = new Quadrant(10, 10, j + 1, i + 1, this);
        }
      }
    }
  }

  makeStars() {}

  addGameObject(gameObject, quadrantX, quadrantY, sectorX, sectorY) {}

  getRow(i) {
    return this.quandrants[i];
  }

  getColumn(i) {
    // todo::
  }

  // column and row are 1 based
  getQuadrant(column, row) {
    return this.quandrants[column - 1][row - 1];
  }
}
