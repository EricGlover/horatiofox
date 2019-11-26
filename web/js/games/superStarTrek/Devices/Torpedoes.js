import {terminal} from "../Terminal.js";
import {Device, photonTorpedoLauncherType} from "./Devices.js";
import {AbstractEnemy} from "../Enemies/Enemies.js";
import {Collider} from "../Components/Collider";
import {GameObject} from "../Components/GameObject";
import {Mover} from "../Components/Mover";

class Torpedo {
    constructor(firedFrom) {
        this.gameObject = new GameObject(this, false);
        this.mover = new Mover(this, this.gameObject);
        this.proximity = new Collider(this, this.gameObject, 100, 100, 1);
        this.collider = new Collider(this, this.gameObject, 1, 1, 1);
        this.damage = 100;
        this.firedFrom = firedFrom;
    }

    die() {
        this.gameObject.removeSelf();
    }

    // we can't hit ourselves, things without colliders, or the ship we were fired from
    _canHit(obj) {
        return obj !== this && obj.collider && obj !== this.firedFrom;
    }

    // did obj trigger torpedoes proximity sensor ?
    proximityHit(obj) {
        if (!this._canHit(obj)) return false;
        if (!(obj instanceof AbstractEnemy)) return false;
        return this.proximity.collision(obj);
    }

    // did obj collide with the body of the torpedo
    bodyHit(obj) {
        if (!this._canHit(obj)) return false;
        return this.collider.collision(obj);
    }
}


export class PhotonTorpedoLauncher extends Device {
    constructor(parent, count = 0, capacity = 0, maxBurst = 1) {
        super(parent, photonTorpedoLauncherType);
        this.terminal = terminal;
        this._capacity = capacity;
        this._torpedoes = count;
        this.maxBurst = maxBurst;
    }

    addTorpedoes(n) {
        this.checkDamage();
        if (n <= 0) {
            return;
        } else if (this._torpedoes + n > this._capacity) {
            this._torpedoes = this._capacity;
            return;
        }
        this._torpedoes += n;
    }

    getTorpedoCount() {
        return this._torpedoes;
    }

    // fire at sector x y , can be floats or ints
    fire(coordinates) {
        this.checkDamage();
        if (this.isDamaged()) {
            this.terminal.echo("Photon torpedoes are damaged and can't fire.");
            return;
        }
        if (this._torpedoes <= 0) {
            this.terminal.echo("Not enough torpedoes.");
            return;
        }
        this._torpedoes--;

        // make torpedo
        let torpedo = new Torpedo(this.parent);

        // place torpedo at our current position
        torpedo.gameObject.placeIn(this.parent.gameObject.galaxy,
            this.parent.gameObject.quadrant,
            this.parent.gameObject.sector);

        /// calculate the direction to shoot the torpedo
        let quadrant = this.parent.gameObject.quadrant;
        let vectorTo = this.parent.gameObject.coordinates.getVectorTo(coordinates);

        //
        let moveGenerator = torpedo.mover.moveInDirection(vectorTo.angle);
        let ret;
        let keepGoing = true;
        let hit = false;
        let thingHit = null;
        let trackingLocations = [];
        do {
            ret = moveGenerator.next(keepGoing);
            // if we've left the quadrant then stop
            if (torpedo.gameObject.quadrant !== quadrant) {
                console.log("We've left the quadrant.", quadrant, torpedo.gameObject.quadrant);
                moveGenerator.next(false);
                break;
            }
            let {sXFl, sYFl} = torpedo.gameObject.getLocation();
            trackingLocations.push(`${sXFl.toFixed(1)} - ${sYFl.toFixed(1)}`);
            // check for collisions, could do a better job of broad sweeping here...
            // get stuff in the torpedo's current sector, and the adjacent ones
            // and nearby sectors
            let sectors = torpedo.gameObject.sector.getAdjacentSectors(true);

            // check for collisions
            sectors.forEach(sector => {
                if (hit) return;
                sector.container.getAllGameObjects().forEach(obj => {
                    if (hit) return;
                    if (torpedo.proximityHit(obj) || torpedo.bodyHit(obj)) {
                        hit = true;
                        thingHit = obj;
                        console.log("HIT!!!", obj);
                    }
                });
            });

            if (hit) {
                moveGenerator.next(false);
                break;
            }
        } while (!ret.done);

        // print tracking coordinates
        for (let i = 0; i < trackingLocations.length; i++) {
            //print first and last, otherwise skip every other one
            if (i === 0) {
                this.terminal.echo(`${trackingLocations[i]}    `);
            } else if (i === trackingLocations.length - 1) {
                this.terminal.echo(`${trackingLocations[i]}`);
            } else if (i % 2 === 0) {
                this.terminal.echo(`${trackingLocations[i]}    `);
            }

        }
        this.terminal.echo("\n");
        // we've hit something or left the quadrant
        if (hit) {
            thingHit.collider.takeHit(torpedo.damage);
        } else {
            this.terminal.printLine("Torpedo missed and has left the quadrant!");
        }
        torpedo.die();
    }
}