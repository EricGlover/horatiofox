import { GameObject } from "../Components.js";
export class AbstractEnemy {}
export class AbstractKlingon extends AbstractEnemy {}
export class Klingon extends AbstractKlingon {
  constructor() {
    super();
    this.gameObject = new GameObject(this);
  }
}
export class KlingonCommander extends AbstractKlingon {
  constructor() {
    super();
    this.gameObject = new GameObject(this);
  }
}

export class KlingonSuperCommander extends AbstractKlingon {
  constructor() {
    super();
    this.gameObject = new GameObject(this);
  }
}
export class Romulan extends AbstractEnemy {
  constructor() {
    super();
    this.gameObject = new GameObject(this);
  }
}
