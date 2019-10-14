import { GameObject, Collider } from "../Components.js";

export default class Planet {
  constructor(pClass, hasCrystals, known = false) {
    this.gameObject = new GameObject(this, true);
    this.collider = new Collider(this, this.gameObject, 80, 80, 1000);
    this._planetClass = null;
    this.planetClass = pClass; // M N or O
    this.hasCrystals = hasCrystals;
    this.known = false;
    this.name = "planet";
  }

  get planetClass() {
    return this._planetClass;
  }
  set planetClass(c) {
    if (!c) return;
    c = c.toLowerCase();
    if (c !== "m" && c !== "n" && c !== "o") {
      throw new Error(`Planet Class ${c} invalid.`);
    }
    this._planetClass = c;
  }
  // randomly set the values for our planet
  randomlyGenerate() {
    // set the class
    let r = Math.random();
    if (r > 2 / 3) {
      this.planetClass = "m";
    } else if (r > 1 / 3) {
      this.planetClass = "n";
    } else {
      this.planetClass = "o";
    }
    // determine if it has crystals
    this.hasCrystals = Math.random() > 2 / 3;
  }
}
