import {GameObject, Collider} from "../Components.js";

export default class StarBase {
    constructor() {
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 100, 100, 1000);
        this.name = "star base";
    }
}
