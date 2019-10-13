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
  constructor(parent) {
    this.parent = parent;
    this.gameObject = this.parent.gameObject;
    // speed ?
  }

  calculateDisplacement(sector) {
    // find delta x, delta y in global coordinates
    let deltaX = sector.globalX - this.gameObject.sector.globalX;
    let deltaY = sector.globalY - this.gameObject.sector.globalY;
    return {x: deltaX, y: deltaY};
  }
  calculateDestination(deltaQy = 0, deltaQx = 0, deltaSy = 0, deltaSx = 0) {
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
  // delta = max amount to move per move
  *moveTo(globalX, globalY, delta) {
    // find total distance
    let distance = Mover.calculateDistance(this.gameObject.x, this.gameObject.y, globalX, globalY);
    let remaining = distance;
    // total x and y
    let distanceX = Math.abs(this.gameObject.x - globalX);
    let distanceY = Math.abs(this.gameObject.y - globalY);
    // angle
    let theta = Math.atan( distanceY / distanceX);
    // find deltaX and deltaY (amount to move each move)
    let deltaX = delta * Math.cos(theta);
    let deltaY = delta * Math.sin(theta);

    let keepGoing = true;
    while(remaining > 0 && keepGoing) {
      // move by deltax deltay
      this.gameObject.x += deltaX;
      this.gameObject.y += deltaY;
      remaining -= delta;
      keepGoing = yield;
    }
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
  placeIn(galaxy, quadrant, sector) {
    // check that sector is empty
    if (!sector.container.isEmpty()) {
      throw new Error("Cant place object in non empty sector");
    }
    this.galaxy = galaxy;
    this.quadrant = quadrant;
    this.sector = sector;
    this.galaxy.container.addGameObject(this.parent);
    this.quadrant.container.addGameObject(this.parent);
    this.sector.container.addGameObject(this.parent);
    // set x and y (sector x and y are topleft point)
    // place in the center ...
    this.x = this.sector.globalX + .5;
    this.y = this.sector.globalY + .5;
  }
  // todo:: modify getSectorXY to correctly display
  // when coordinates are not in the center of a center
  getSectorY() {
    return this.sector.y;
  }
  getSectorX() {
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
  getSectorLocation() {
    return `Sector ${this.getSectorX() + 1} - ${this.getSectorY() + 1}`;
  }
}

// rename later
// movable component
export class MoveableGameObject {
  constructor(gameObject) {
    this.gameObject = gameObject;
  }
  move(galaxy, quadrant, sector) {}
}
