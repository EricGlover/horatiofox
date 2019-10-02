import { GameObject } from "../Components.js";
export default class Planet {
  constructor(pClass, hasCrystals, known = false) {
    this.gameObject = new GameObject(this);
    this.class = pClass; // M N or O
    this.hasCrystals = hasCrystals;
    this.known = false;
  }
}
