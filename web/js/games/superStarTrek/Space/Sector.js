import {GameObjectContainer} from "../Components/GameObject.js";

export class Sector {
    constructor(quadrant, topLeftCoordinates, x, y) {
        this.container = new GameObjectContainer(this);
        this.quadrant = quadrant;
        this.galaxy = quadrant.galaxy;
        this._x = x;    // place in quadrant
        this._y = y;    // place in quadrant
        this.width = 1;
        this.length = 1;
        this.topLeft = topLeftCoordinates;
        this.topRight = topLeftCoordinates.add(this.width);
        this.bottomLeft = topLeftCoordinates.add(0, this.length);
        this.bottomRight = topLeftCoordinates.add(this.width, this.length);
        this.center = topLeftCoordinates.add(this.width / 2, this.length / 2);
    }

    getAdjacentSectors(includeSelf = false) {
        return this.quadrant.getSectorsAdjacentTo(this, includeSelf);
    }

    // game object that take up the whole sector
    // fill up the whole sector (Planets, Bases, Stars, BlackHoles, Ships, etc..)
    isFull() {
        return this.container.getAllGameObjects().some(obj => obj.gameObject.takesWholeSector);
    }
}