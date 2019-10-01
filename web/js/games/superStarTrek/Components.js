// game objects and containers work together
// is something that can contain game objects
export class GameObjectContainer {
  constructor(parent) {
    this.parent = parent;
    this.parent.container = this;
    this.gameObjects = [];
  }
  getGameObjectsOfType(type) {
    return this.gameObjects.reduce((count, object) => {
      if (object instanceof type) count++;
      return count;
    }, 0);
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
    this.galaxy = galaxy;
    this.quadrant = quadrant;
    this.sector = sector;
    this.galaxy.container.addGameObject(this.parent);
    this.quadrant.container.addGameObject(this.parent);
    this.sector.container.addGameObject(this.parent);
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
