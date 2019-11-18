import {terminal} from "../Terminal.js";
import {Device, phaserType} from "./Devices.js";
import {Shields} from "./Shields";
import {Collider} from "../Components/Collider";

export class Phasers extends Device {
    constructor(parent, energySystem) {
        super(parent, phaserType);
        if (!energySystem) {
            throw new Error('Phaser must have energy');
        }
        this.energySystem = energySystem;
        this.amountRecentlyFired = 0;
        this.overheatThreshold = 1500;
        this.terminal = terminal;
        // this is used to calculate the energy that dissipates over distance
        this.scalingFactor = .9;
        this.maxScalingFactor = this.scalingFactor + .01;
        this.minScalingFactor = this.scalingFactor;
    }

    // energy * (scaling ** distance) = damage
    // so energy = damage / (scaling ** distance)
    calculateSureKill(distance, damage) {
        return damage / (this.minScalingFactor ** distance);
    }

    calculateDamage(distance, energy) {
        let scalingBase = this.scalingFactor + (.01 * Math.random());
        return energy * (scalingBase ** distance);
    }

    coolDown() {
        this.amountRecentlyFired = 0;
    }

    // check to see if the phasers overheated
    checkOverHeat() {
        if (this.amountRecentlyFired > this.overheatThreshold) {
            /**
             double chekbrn = (rpow-1500.)*0.00038;
             if (Rand() <= chekbrn) {
                prout("Weapons officer Sulu-  \"Phasers overheated, sir.\"");
                damage[DPHASER] = damfac*(1.0 + Rand()) * (1.0+chekbrn);
            }**/
            let diff = this.amountRecentlyFired - this.overheatThreshold;
            // if (Math.random() <= diff * .00038) {
            //     this.terminal.printLine(`Phasers overheated!`);
            //     this._damaged = true;
            // }
            if (Math.random() <= diff * .0038) {
                this.terminal.printLine(`Phasers overheated!`);
                this.randomlyDamage();
            }
        }
    }

    fire(amount, target) {
        if (amount <= 0) {
            console.error("Can't fire amount ", amount);
            return;
        }
        if (!target) {
            console.error("Need a target, ", target);
            return;
        }
        // target needs to be targetable
        if (!(target.collider instanceof Collider)) {
            console.error("You can't hit that", target);
            return;
        }
        // device can't be damaged
        this.checkDamage();
        if (this.isDamaged()) {
            this.terminal.printLine('Phaser control damaged.');
            return;
        }
        if (!this.parent.gameObject) {
            console.error('derp a lerp.');
            throw new Error("derp a lerp.");
            return;
        }

        if (!target.gameObject || !target.gameObject.isInGame()) {
            console.error("Can't shoot something removed from the game.");
            return;
        }

        // get distance
        let distance = Galaxy.calculateDistance(this.parent.gameObject.sector, target.gameObject.sector);
        // distance scaling
        let damage = this.calculateDamage(distance, amount);

        // if they have shields hit the shields
        if (target.shields instanceof Shields) {
            target.shields.takeHit(damage);
        } else if (target.collider instanceof Collider) {   // else the thing itself takes a beating
            target.collider.takeHit(damage);
        }
        // target.collider.takeHit(damage);

        this.amountRecentlyFired += amount;
        this.checkOverHeat();
    }
}