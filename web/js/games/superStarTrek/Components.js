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
  calculateDistance(sector) {
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
  calculateTime() {

  }
  moveTo(sector) {
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
  constructor(parent) {
    this.parent = parent;
    this.parent.gameObject = this;
    this.galaxy = null;
    this.quadrant = null;
    this.sector = null;
  }
  removeSelf() {
    this.galaxy.container.removeGameObject(this.parent);
    this.quadrant.container.removeGameObject(this.parent);
    this.sector.container.removeGameObject(this.parent);
    this.galaxy = null;
    this.quadrant = null;
    this.sector = null;
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
  }
  getLocation() {
    return `Quadrant: ${this.quadrant.x + 1} - ${this.quadrant.y + 1}; Sector: ${this.sector.x + 1} - ${this.sector.y + 1}`;
  }
  getQuadrantLocation() {
    return `Quadrant ${this.quadrant.x + 1} - ${this.quadrant.y + 1}`;
  }
  getSectorLocation() {
    return `Sector ${this.sector.x + 1} - ${this.sector.y + 1}`;
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
