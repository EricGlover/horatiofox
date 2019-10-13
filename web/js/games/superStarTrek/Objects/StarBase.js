import { GameObject } from "../Components.js";
export default class StarBase {
  constructor() {
    this.gameObject = new GameObject(this, true);
  }
}
