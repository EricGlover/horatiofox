import {GameObject, Collider} from "../Components.js";

export default class BlackHole {
    constructor() {
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 25, 25);
        this.collider.makeIndestructible();
        this.name = "black hole";
    }
}
