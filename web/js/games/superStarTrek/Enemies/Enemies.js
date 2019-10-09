import { GameObject } from "../Components.js";
import {Target} from '../Devices.js';

export class AbstractEnemy {
  constructor() {
    this.target = new Target(this);
    this.gameObject = new GameObject(this);
  }
  die() {
    this.gameObject.removeSelf();
    console.log("You killed ", this);
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
