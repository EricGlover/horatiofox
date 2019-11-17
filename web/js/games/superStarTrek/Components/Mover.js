// things that can move
import {Vector} from "../Space/Coordinates.js";
import {Component} from "./Component.js";

export class Mover extends Component {
    constructor(parent, gameObject) {
        super(Mover, parent);
        this.gameObject = gameObject;
    }

    static get propName() {
        return "mover";
    }

    // calculateDirectionTo(globalX, globalY) {
    //     // let deltaX = globalX - this.gameObject./// calculate the direction to shoot the torpedo
    //     //     // let
    //     // quadrant = this.parent.gameObject.quadrant;
    //     // // deltas are to - from, BUT because the y axis is inverted from
    //     // // the normal math y axis you'll need to flip the y
    //     // let deltaX = x - this.parent.gameObject.x;
    //     // let deltaY = -1 * (y - this.parent.gameObject.y);
    //     // let theta = Math.atan2(deltaY, deltaX);    // -PI , PI
    // }

    // calculateDestination(deltaQx = 0, deltaQy = 0, deltaSx = 0, deltaSy = 0) {
    //     let move = Vector.make1(deltaQx, deltaQy, deltaSx, deltaSy);
    //     return this.gameObject.coordinates.addVector(move);
    // }

    calculateTime(distance, warpFactor) {
        return distance / Math.pow(warpFactor, 2);
    }

    calculateDistance(time, warpFactor) {
        return Math.pow(warpFactor, 2) * time;
    }

    calculateWarpFactor(time, distance) {
        return Math.sqrt(distance / time);
    }

    // @returns float
    // static calculateDistance(x1, y1, x2, y2) {
    //     let deltaX = Math.abs(x2 - x1);
    //     let deltaY = Math.abs(y2 - y1);
    //     return Math.hypot(deltaX, deltaY);
    // }

    *move(vector, delta = .5) {
        if(!(vector instanceof Vector)) {
            throw new Error("not vector");
        }
        let m = vector.scale(delta);
        let i = 0;
        let keepGoing = true;
        let c = this.gameObject.coordinates;
        while(keepGoing) {
            if (i > 1000) return;
            if(!this.gameObject.isInGame()) return;
            c.x += m.deltaX;
            c.y += m.deltaY;

            this.gameObject.updateCoordinates();
            keepGoing = yield;
            i++;
        }
        return;
    }

    // theta is our direction, delta is our distance per move
    * moveInDirection(theta, delta = .5) {
        // find deltaX and deltaY (amount to move each move)
        // this finds the x and y of the right triangle using delta as hypotenuse
        let deltaX = delta * Math.cos(theta);
        let deltaY = delta * Math.sin(theta);  // y axis is inverted
        let i = 0;  // failsafe
        let keepGoing = true;
        let c = this.gameObject.coordinates;
        while (keepGoing) {
            if (i > 1000) return;
            c.x += deltaX;
            c.y += deltaY;

            this.gameObject.updateCoordinates();
            keepGoing = yield;
            i++;
        }
        return;
    }

    // delta = max amount to move per move
    * moveTo(globalX, globalY, delta = .5) {
        debugger;
        // find total distance
        // let distance = Mover.calculateDistance(this.gameObject.x, this.gameObject.y, globalX, globalY);
        let remaining = distance;
        // total x and y
        // let distanceX = Math.abs(this.gameObject.x - globalX);
        // let distanceY = Math.abs(this.gameObject.y - globalY);
        // angle  // todo:: check this later
        let theta = Math.atan2(this.gameObject.y - globalY / this.gameObject.x - globalX);
        // find deltaX and deltaY (amount to move each move)
        // this finds the x and y of the right triangle using delta as hypotenuse
        let deltaX = delta * Math.cos(theta);
        let deltaY = delta * Math.sin(theta);

        let keepGoing = true;
        while (remaining > 0 && keepGoing) {
            // todo:: check bounds
            // move by deltax deltay, or the remaining distance (whichever is less)
            let remainingX = Math.abs(globalX - this.gameObject.x);
            let remainingY = Math.abs(globalY - this.gameObject.y);
            // don't overshoot the landing
            if (remainingX < deltaX) {
                deltaX = globalX - this.gameObject.x;
            }
            if (remainingY < deltaY) {
                deltaY = globalY - this.gameObject.y;
            }
            this.gameObject.x += deltaX;
            this.gameObject.y += deltaY;
            this.gameObject.updateCoordinates();
            remaining -= delta; // technically incorrect if deltas modified but whatever
            if (remaining <= 0) {
                return;
            }
            keepGoing = yield;
        }
        return;
    }

    // only basic collision detection
    // drops the object into the sector
    moveToSector(sector) {
        // collision detection
        if (sector.isFull()) {
            debugger;
        }
        this.gameObject.sector.container.removeGameObject(this.parent);
        this.gameObject.quadrant.container.removeGameObject(this.parent);
        this.gameObject.placeIn(this.gameObject.galaxy, sector.quadrant, sector);
    }
}