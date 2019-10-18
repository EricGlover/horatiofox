export default class AI {
    constructor(parent, galaxy, player) {
        this.parent = parent;
        this.parent.ai = this;
        this.galaxy = galaxy;
        this.player = player;
    }

    getPlayer() {

    }

    takeTurn() {
        // debugger;
        console.log(`${this.parent.name} taking a turn.`);
        // decide between these
        // move

        // fire phasers
        this.firePhasers();
        // fire torpedo
    }

    firePhasers() {
        this.parent.phasers.fire(200, this.player);
        this.parent.energy -= 200;
    }
}