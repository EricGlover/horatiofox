import { GameObject } from "../Components.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";

const CONDITION_GREEN = 1;
const CONDITION_YELLOW = 2;
const CONDITION_RED = 3;
const CONDITION_DOCKED = 4;

class Shields {
  constructor() {
    this.up = false;
    this.units = 2500;
  }
  printInfo() {
    return `${this.up ? "UP" : "DOWN"}, 100% ${this.units} units`;
  }
}

export default class Enterprise {
  constructor() {
    this.gameObject = new GameObject(this);
    this.energy = 5000.00; //todo::
    this.warpFactor = 5.0; // todo:::
    this.torpedoes = 10;
    this.shields = new Shields();
    this.docked = false;  // todo::
  }
  hasLifeSupport() {
    // TODO::
    return true;
  }
  getCondition() {
    let enemies = this.gameObject.quadrant.container.getCountOfGameObjects(AbstractEnemy);
    if(this.docked) {
      return CONDITION_DOCKED;
    } else if(enemies > 0) {
        return CONDITION_RED;
    } else if (this.energy < 1000) {
        return CONDITION_YELLOW;
    } else {
        return CONDITION_GREEN;
    }
  }

  printCondition() {
    switch (this.getCondition()) {
      case CONDITION_DOCKED:
        return "DOCKED";
      case CONDITION_GREEN:
        return "GREEN";
      case CONDITION_YELLOW:
        return "YELLOW";
      case CONDITION_RED:
        return "RED";
      default:
        console.error('condition not recognized.');
    }
  }
}
