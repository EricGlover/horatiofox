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
    // todo::;
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
    return `Quadrant: ${this.quadrant.y} - ${this.quadrant.x}; Sector: ${this.sector.y} - ${this.sector.y}`;
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
