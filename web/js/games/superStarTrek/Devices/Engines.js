import {Sector} from "../Space/Sector.js";
import {Device, EngineDeviceType, impulseEngineType, warpEngineType} from "./Devices.js";
import {PowerGrid} from "./PowerGrid";
import {GameObject} from "../Components/GameObject";
import {Mover} from "../Components/Mover";
/**
 * Warp Engines and Impulse Engines are both instances of Engines but they have different types
 * Controls setting the warpFactor (impulse can't, warp has a range)
 * Uses gameObject and Galaxy to calculate distance
 * Uses mover to move the game object
 * Uses power grid to consume power
 * This could be extended to different engines
 */
export class Engines extends Device {
    constructor(parent, type, powerGrid, gameObject, mover, minWarp, maxWarp, adjustableWarpFactor = false) {
        if (!(type instanceof EngineDeviceType)) {
            throw new Error("Engines must have a type deriving from EngineDeviceType.");
        }
        if (!(gameObject instanceof GameObject)) {
            throw new Error("Engines must have a game object");
        }
        if (!(mover instanceof Mover)) {
            throw new Error("Engines must have a mover");
        }
        if (!(powerGrid instanceof PowerGrid)) {
            throw new Error("Engines require a power grid");
        }
        super(parent, type);
        this.powerGrid = powerGrid;
        this.mover = mover;
        this.gameObject = gameObject;
        this._warpFactor = minWarp;
        this._warpFactorIsAdjustable = adjustableWarpFactor;
        this._maxWarpFactor = maxWarp;
        this._minWarpFactor = minWarp;
    }

    get warpFactor() {
        return this._warpFactor;
    }

    set warpFactor(n) {
        if (!this._warpFactorIsAdjustable) {
            throw new Error("Warp factor is not adjustable");
        }
        this.checkDamage();
        if (typeof n !== "number" || Number.isNaN(n)) {
            return;
        } else if (n < this._minWarpFactor || n > this._maxWarpFactor) {
            return;
        }
        this._warpFactor = n;
    }

    calculateTimeRequired(distance) {
        return this.mover.calculateTime(distance, this.warpFactor);
    }

    calculateEnergyUsage(distance) {
        let energy = .1 * distance * Math.pow(this.warpFactor, 3);
        if (this.parent.shields && this.parent.shields.up) energy *= 2;
        return energy;
    }

    moveTo(sector) {
        if (!(sector instanceof Sector)) {
            throw new Error("Can't move there");
        }
        this.checkDamage();
        this.powerGrid.checkDamage();

        // calculate distance, and energy required
        let distance = Galaxy.calculateDistance(this.gameObject.sector, sector);
        //( .1 * distance in sectors = distance in quadrants ) * warpFactor ^ 3
        let energy = this.calculateEnergyUsage(distance);

        if (this.powerGrid.energy < energy) {
            throw new Error("Not enough energy.");
        }

        this.mover.moveToSector(sector);
        this.powerGrid.useEnergy(energy);
    }

    static makeWarpEngines(parent, powerGrid, gameObject, mover) {
        return new Engines(parent, warpEngineType, powerGrid, gameObject, mover, 1.0, 10.0, true);
    }

    static makeImpulseEngines(parent, powerGrid, gameObject, mover) {
        return new Engines(parent, impulseEngineType, powerGrid, gameObject, mover, .975, .975, false);
    }
}