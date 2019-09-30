//hhmmmmm..... inheritance or composition ?
export class Ship {}

export class Klingon {}

export class Star {}

export class Starbase {}

export class Quadrant {
  constructor() {
    this.hasSupernova = false;
    this.klingons = [];
    this.starbases = [];
    this.stars = [];
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
          row[j] = new Quadrant();
        }
      }
    }
  }

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
