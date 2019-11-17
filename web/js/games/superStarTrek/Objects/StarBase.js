import {Collider} from "../Components/Collider";
import {GameObject} from "../Components/GameObject";

export default class StarBase {
    constructor() {
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 25, 25, 1000);
        this.name = "star base";
    }
}
