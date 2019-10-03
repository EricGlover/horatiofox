import { GameObject } from "../Components.js";

export default class Enterprise {
  constructor() {
    this.gameObject = new GameObject(this);
  }
  getCondition() {
    // red if enemies present in our quadrant
    // yellow if energy < 1000
    // otherwise green
  }
}
