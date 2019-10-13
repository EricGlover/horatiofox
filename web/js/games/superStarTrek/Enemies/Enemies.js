import { GameObject } from "../Components.js";
import {Collider} from '../Devices.js';

import {terminal} from '../Terminal.js';

export class AbstractEnemy {
  constructor() {
    this.gameObject = new GameObject(this, true);
    this.collider = new Collider(this, this.gameObject, 80, 80);
    this.terminal = terminal;
    this.name = this.constructor.name;
  }
  die() {
    this.terminal.printLine(`${this.name} at ${this.gameObject.getSectorLocation()} was destroyed.`);
    console.log("You killed ", this);
    this.gameObject.removeSelf();
  }
}
export class AbstractKlingon extends AbstractEnemy {}
export class Klingon extends AbstractKlingon {
  constructor() {
    super();
    this.collider.health = 40;
  }
}
export class KlingonCommander extends AbstractKlingon {
  constructor() {
    super();
    this.collider.health = 100;
  }
}

export class KlingonSuperCommander extends AbstractKlingon {
  constructor() {
    super();
    this.collider.health = 400;
  }
}
export class Romulan extends AbstractEnemy {
  constructor() {
    super();
    this.collider.health = 40;
  }
}
