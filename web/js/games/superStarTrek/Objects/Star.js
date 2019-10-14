import { GameObject, Collider } from "../Components.js";
export default class Star {
  constructor() {
    this.gameObject = new GameObject(this, true);
    this.collider = new Collider(this, this.gameObject, 80, 80, 1000);
    this.collider.makeIndestructible();
    this.name = "Star";
  }
}
