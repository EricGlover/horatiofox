import { GameObject } from "../Components.js";

export default class BlackHole {
  constructor() {
    this.gameObject = new GameObject(this, true);
  }
}
