import {Component} from "./Components.js";

export default class AI extends Component {
    constructor(parent, galaxy, player) {
        super("ai", parent);
        this.parent = parent;
        this.parent.ai = this;
        this.galaxy = galaxy;
        this.player = player;
    }

    takeTurn() {
        // debugger;
        console.log(`${this.parent.name} taking a turn.`);
        // decide between these
        // move

        // if power below 20% then move to ram
        if(this.parent.powerGrid.getPercent() <= .2) {
            console.error("RAMMING PLAYER NOW");
        }
        // fire phasers
        this.firePhasers();
        // fire torpedo
    }

    firePhasers() {
        // fire between 20% and 60% of our energy
        let amountToFire = this.parent.powerGrid.capacity * (Math.random() * .4 + .2);
        amountToFire = Math.min(amountToFire, this.parent.powerGrid.energy);
        if(amountToFire === 0) {
            console.error("OUT OF ENERGY");
            return;
        }

        this.parent.phasers.fire(amountToFire, this.player);
        this.parent.powerGrid.useEnergy(amountToFire);  // todo:::
        this.parent.phasers.coolDown();
    }
}