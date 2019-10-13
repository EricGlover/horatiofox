// game objects and containers work together
// is something that can contain game objects
export class GameObjectContainer {
  constructor(parent) {
    this.parent = parent;
    this.parent.container = this;
    this.gameObjects = [];
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
export class Mover {
  constructor(parent, gameObject) {
    this.parent = parent;
    this.gameObject = gameObject;
  }

  calculateDisplacement(sector) {
    // find delta x, delta y in global coordinates
    let deltaX = sector.globalX - this.gameObject.sector.globalX;
    let deltaY = sector.globalY - this.gameObject.sector.globalY;
    return {x: deltaX, y: deltaY};
  }

  calculateDestination(deltaQx = 0, deltaQy = 0, deltaSx = 0, deltaSy = 0) {
    let sector = this.gameObject.sector;
    let x = sector.globalX + (deltaQx * 10) + deltaSx;
    let y = sector.globalY + (deltaQy * 10) + deltaSy;
    return this.gameObject.galaxy.getSectorGlobal(x, y);
  }

  // @returns float
  static calculateDistance(x1, y1, x2, y2) {
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    return Math.hypot(deltaX, deltaY);
  }

  // theta is our direction, delta is our distance per move
  *moveInDirection(theta, delta = .5) {
    // find deltaX and deltaY (amount to move each move)
    // this finds the x and y of the right triangle using delta as hypotenuse
    let deltaX = delta * Math.cos(theta);
    let deltaY = delta * Math.sin(theta);

    let i = 0;  // failsafe
    let keepGoing = true;
    while(keepGoing) {
      if(i > 1000) return;
      // todo:: check bounds
      this.gameObject.x += deltaX;
      this.gameObject.y += deltaY;
      this.gameObject.updateSectorAfterMove();
      keepGoing = yield;
      i++;
    }
    return;
  }

  // delta = max amount to move per move
  *moveTo(globalX, globalY, delta = .5) {
    debugger;
    // find total distance
    let distance = Mover.calculateDistance(this.gameObject.x, this.gameObject.y, globalX, globalY);
    let remaining = distance;
    // total x and y
    let distanceX = Math.abs(this.gameObject.x - globalX);
    let distanceY = Math.abs(this.gameObject.y - globalY);
    // angle
    let theta = Math.atan( distanceY / distanceX);
    // find deltaX and deltaY (amount to move each move)
    // this finds the x and y of the right triangle using delta as hypotenuse
    let deltaX = delta * Math.cos(theta);
    let deltaY = delta * Math.sin(theta);

    let keepGoing = true;
    while(remaining > 0 && keepGoing) {
      // todo:: check bounds
      // move by deltax deltay, or the remaining distance (whichever is less)
      let remainingX = Math.abs(globalX - this.gameObject.x);
      let remainingY = Math.abs(globalY - this.gameObject.y);
      // don't overshoot the landing
      if(remainingX < deltaX) {
        deltaX = globalX - this.gameObject.x;
      }
      if(remainingY < deltaY) {
        deltaY = globalY - this.gameObject.y;
      }
      this.gameObject.x += deltaX;
      this.gameObject.y += deltaY;
      this.gameObject.updateSectorAfterMove();
      remaining -= delta; // technically incorrect if deltas modified but whatever
      if(remaining <= 0) {
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
    if(sector.isFull()) {
      debugger;
    }
    this.gameObject.sector.container.removeGameObject(this.parent);
    this.gameObject.quadrant.container.removeGameObject(this.parent);
    this.gameObject.placeIn(this.gameObject.galaxy, sector.quadrant, sector);
  }
}
// a game object is simply a thing with a position in
// the game
export class GameObject {
  constructor(parent, takesWholeSector = false) {
    this.parent = parent;
    this.parent.gameObject = this;
    this.galaxy = null;
    this.quadrant = null;
    this.sector = null;
    // x and y are floats
    this.x = null;
    this.y = null;
    this.takesWholeSector = takesWholeSector;
  }
  removeSelf() {
    this.galaxy.container.removeGameObject(this.parent);
    this.quadrant.container.removeGameObject(this.parent);
    this.sector.container.removeGameObject(this.parent);
    this.galaxy = null;
    this.quadrant = null;
    this.sector = null;
    // global coordinates
    this.x = null;
    this.y = null;
  }

  // check that sector is empty
  canMoveTo(sector) {
    if (this.takesWholeSector && !sector.container.isEmpty()) {
      return false;
    }
    return true;
  }

  updateSectorAfterMove() {
    let currentSector = this.galaxy.getSectorGlobal(this.x, this.y);
    if(currentSector !== this.sector) {
      if(!this.canMoveTo(currentSector)) {
        throw new Error("Cant place object in non empty sector");
      }
      this.quadrant.container.removeGameObject(this.parent);
      this.sector.container.removeGameObject(this.parent);
      this.quadrant = currentSector.quadrant;
      this.sector = currentSector;
    }
  }

  // the x and y in the sector 0 - 0 is top left
  // .5 - .5 is center
  placeIn(galaxy, quadrant, sector, x = .5, y = .5) {
    if(!this.canMoveTo(sector)) {
      throw new Error("Cant place object in non empty sector");
    }
    this.galaxy = galaxy;
    this.quadrant = quadrant;
    this.sector = sector;
    this.galaxy.container.addGameObject(this.parent);
    this.quadrant.container.addGameObject(this.parent);
    this.sector.container.addGameObject(this.parent);

    // set global x y
    this.x = this.sector.globalX + x;
    this.y = this.sector.globalY + y;
  }
  // todo:: modify getSectorXY to correctly display
  // when coordinates are not in the center of a center
  getSectorY(float = false) {
    // if(float) {
    //   return this.y % this.quadrant.width;
    // }
    return this.sector.y;
  }
  getSectorX(float = false) {
    // if(float) {
    //   return this.x % this.quadrant.width;
    // }
    return this.sector.x;
  }
  getLocation() {
    return `${this.getQuadrantLocation()}; ${this.getSectorLocation()}`;
  }
  getQuadrantLocation() {
    return `Quadrant ${this.quadrant.x + 1} - ${this.quadrant.y + 1}`;
  }
  // ugggghhhhh... coordinate systems
  // todo:::
  getSectorLocation(includeSector = true, float) {
    return `${includeSector ? 'Sector ' : ''}${this.getSectorX() + 1} - ${this.getSectorY() + 1}`;
  }
  getSectorLocationFloat(includeSector = true) {
    let x = ((this.x % this.quadrant.width) + .5).toFixed(1);
    let y = ((this.y % this.quadrant.width) + .5).toFixed(1);
    return `${includeSector ? 'Sector ' : ''}${x} - ${y}`
  }
}
