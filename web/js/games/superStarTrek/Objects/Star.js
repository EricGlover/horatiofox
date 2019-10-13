import { GameObject } from "../Components.js";
export default class Star {
  constructor() {
    this.gameObject = new GameObject(this, true);
  }
}
