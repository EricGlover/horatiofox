// a thing that holds game objects
import {Component} from "./Component.js";
import {Coordinates} from "../Space/Coordinates.js";

export class GameObjectContainer extends Component {
    constructor(parent) {
        super(GameObjectContainer, parent);
        this.gameObjects = [];
    }

    static get propName() {
        return "container";
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

// a game object is simply a thing with a position in
// the game
export class GameObject extends Component {
    constructor(parent, takesWholeSector = false, galaxy = null) {
        super(GameObject, parent);
        this.galaxy = galaxy;
        this.quadrant = null;
        this.sector = null;
        this.coordinates = new Coordinates();
        this.takesWholeSector = takesWholeSector;
    }

    static get propName() {
        return "gameObject";
    }

    // if something was removed from the game...
    isInGame() {
        if (!this.galaxy || !this.quadrant || !this.sector) {
            return false;
        }
        return true;
    }

    get name() {
        if (this.parent.name) {
            return this.parent.name;
        } else {
            return this.parent.constructor.name;
        }
    }

    removeSelf() {
        this.galaxy.container.removeGameObject(this.parent);
        this.quadrant.container.removeGameObject(this.parent);
        this.sector.container.removeGameObject(this.parent);
        this.galaxy = null;
        this.quadrant = null;
        this.sector = null;
        this.coordinates = null;
    }

    // update our containers
    updateCoordinates() {
        let currentSector;
        try {
            currentSector = this.galaxy.getSector(this.coordinates);
        } catch (e) {
            // left galaxy
            console.error(e);
            this.removeSelf();
            return;
        }
        if (currentSector !== this.sector) {
            if (!this.canMoveTo(currentSector)) {
                // place it back where it was, update to the old coordinates
                this.coordinates.copy(this.sector.center);
                throw new Error("Cant place object in non empty sector");
            }
            this.quadrant.container.removeGameObject(this.parent);
            this.sector.container.removeGameObject(this.parent);
            this.quadrant = currentSector.quadrant;
            this.sector = currentSector;
        }
    }

    // check that sector is empty
    canMoveTo(sector) {
        if (this.takesWholeSector && !sector.container.isEmpty()) {
            return false;
        }
        return true;
    }

    // the x and y in the sector 0 - 0 is top left
    placeIn(galaxy, quadrant, sector) {
        if (!this.canMoveTo(sector)) {
            throw new Error("Cant place object in non empty sector");
        }
        if (!sector) {
            debugger;
        }
        this.galaxy = galaxy;
        this.quadrant = quadrant;
        this.sector = sector;
        this.galaxy.container.addGameObject(this.parent);
        this.quadrant.container.addGameObject(this.parent);
        this.sector.container.addGameObject(this.parent);
        this.coordinates = sector.center.clone();
    }

    printLocation() {
        return `${this.printQuadrantLocation()}; ${this.printSectorLocation()}`;
    }

    // functions for printing out our location to the user
    printSectorLocation(includeSector = true) {
        return `${includeSector ? 'Sector ' : ''}${this.coordinates.userSectorX} - ${this.coordinates.userSectorY}`;
    }

    printQuadrantLocation() {
        return `Quadrant ${this.coordinates.userQuadrantX} - ${this.coordinates.userQuadrantY}`;
    }

    getLocation() {
        return {
            qX: this.coordinates.userQuadrantX,
            qY: this.coordinates.userQuadrantY,
            sX: this.coordinates.userSectorX,
            sY: this.coordinates.userSectorY,
            sXFl: this.coordinates.userSectorXFloat,
            sYFl: this.coordinates.userSectorYFloat
        }
    }
}