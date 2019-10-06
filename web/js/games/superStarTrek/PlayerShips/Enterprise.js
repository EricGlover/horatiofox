import { GameObject, Mover } from "../Components.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Sector} from '../Galaxy.js';

const CONDITION_GREEN = 1;
const CONDITION_YELLOW = 2;
const CONDITION_RED = 3;
const CONDITION_DOCKED = 4;

class Shields {
  constructor() {
    this.capacity = 2500;
    this.up = false;
    this.units = 2500;
  }
  printInfo() {
    return `${this.up ? "UP" : "DOWN"}, 100% ${this.units} units`;
  }
  recharge() {
    this.units = this.capacity;
  }

  // returns amount drained
  drain(e) {
    if(this.units - e < 0) {
      throw new Error("Not enough energy");
    }
    this.units -= e;

    if(this.units === 0) {
      this.up = false;
    }
    return this.units;
  }
  // returns amount charged
  charge(e) {
    // don't exceed capacity
    if(this.units + e > this.capacity) {
      e = this.capacity - this.units;
    }
    this.units += e;
    return e;
  }
}
class Phasers {
  constructor() {

  }

}
export default class Enterprise {
  constructor() {
    this.energyCapacity = 5000.0;
    this.torpedoCapacity = 10;
    this.gameObject = new GameObject(this);
    this.mover = new Mover(this);
    this.energy = this.energyCapacity; //todo::
    this.warpFactor = 5.0; // todo:::
    this.torpedoes = this.torpedoCapacity;
    this.shields = new Shields();
    this.docked = false;  // todo::
  }
  dock() {
    this.energy = this.energyCapacity;
    this.torpedoes = this.torpedoCapacity;
  }
  impulseTo(sector) {
    // calculate resources needed
    this.mover.moveTo(sector);
  }
  warpTo(sector) {
    if(!sector instanceof Sector) {
      throw new Error("Can't move there");
    }
    // calculate resources needed
    this.mover.moveTo(sector);
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

  // transfer energy from ship to shields, or vice versa if negative
  transferEnergyToShields(e) {
    let exchanged = 0;
    // transfer e to shields
    if(e > 0) {
      let charged = this.shields.charge(e);
      this.useEnergy(charged);
      exchanged = charged;
    } else if (e < 0) { // transfer e from shields
      let drained = 0;
      try {
        this.shields.drain(e);
        drained = e;
      } catch(e) {
        drained = this.shields.units;
        this.shields.drain(this.shields.units);
      }
      console.log("drained = ", drained);
      this.addEnergy(drained);
      exchanged = drained;
    }
    return exchanged;
  }
  useEnergy(e) {
    if(this.energy - e <= 0) {
      throw new Error("Not enough energy!");
    }
    this.energy -= 0;
  }

  addEnergy(e) {
    this.energy += e;
    if(this.energy > this.energyCapacity) {
      this.energy = this.energyCapacity;
    }
  }

  shieldsUp() {
    if(this.shields.up) {
      throw new Error("Shields already up.");
    }
    // raising the shields cost energy
    this.useEnergy(50);
    this.shields.up = true;
  }

  shieldsDown() {
    if(!this.shields.up) {
      throw new Error("Shields already down.");
    }
    this.shields.up = false;
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
