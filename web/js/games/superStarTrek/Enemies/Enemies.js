import { GameObject } from "../Components.js";
import {Target} from '../Devices.js';

import {terminal} from '../Terminal.js';

export class AbstractEnemy {
  constructor() {
    this.target = new Target(this);
    this.gameObject = new GameObject(this);
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
    this.target.health = 40;
  }
}
export class KlingonCommander extends AbstractKlingon {
  constructor() {
    super();
    this.target.health = 100;
  }
}

export class KlingonSuperCommander extends AbstractKlingon {
  constructor() {
    super();
    this.target.health = 400;
  }
}
export class Romulan extends AbstractEnemy {
  constructor() {
    super();
    this.target.health = 40;
  }
}
