export default class AI {
    constructor(parent) {
        this.parent = parent;
        this.parent.ai = this;
    }

    takeTurn() {
        console.log(`${this.parent.name} taking a turn.`);
    }
}