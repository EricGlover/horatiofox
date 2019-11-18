import {Device, probeLauncherType} from "./Devices.js";
import {GameObject} from "../Components/GameObject.js";
import {Mover} from "../Components/Mover.js";
import {Vector} from "../Space/Coordinates.js";
import {GameClock} from "../GameClock.js";
import {Terminal} from "../Terminal.js";
import {StarChart} from "../Space/StarChart.js";
import Star from "../Objects/Star.js";
import {Quadrant} from "../Space/Quadrant.js";


class Probe {
    constructor(armed, clock, terminal, starChart, warpFactor = 10) {
        if (!(clock instanceof GameClock)) {
            throw new Error("needs game clock");
        }
        if (!(terminal instanceof Terminal)) {
            throw new Error("needs terminal");
        }
        if (!(starChart instanceof StarChart)) {
            throw new Error("needs StarChart");
        }
        this.gameObject = new GameObject(this, false);
        this.mover = new Mover(this, this.gameObject);
        this.armed = armed;
        this.clock = clock;
        this.starChart = starChart;
        this.terminal = terminal;
        this.warpFactor = warpFactor;
        this.visited = [];
        this.destination = null;
        this.destinationQuadrant = null;
        this.direction = null;
        this.onTimeElapse = this.onTimeElapse.bind(this);
    }

    clearVisited() {
        this.visited = [];
    }

    launchToward(c, quadrant) {
        this.destination = c;
        this.direction = this.gameObject.coordinates.angleTo(this.destination);
        this.destinationQuadrant = quadrant;
        this.clock.register(this.onTimeElapse);
        this.visited.push(this.gameObject.quadrant);
    }

    onTimeElapse(days) {
        let d = this.mover.calculateDistance(days, this.warpFactor);
        let v = new Vector(d, this.direction);
        let iter = this.mover.move(v, 1);

        // check for reaching new quadrant
        // check for running out of the galaxy
        // on reaching destination quadrant if armed explode the warhead
        // dies if moves into quadrant with a supernova
        let ret;
        let destroyed = false;
        let leftGalaxy = false;
        let exploded = false;
        let quadrantWithSupernova = null;
        do {
            let prevQuad = this.gameObject.quadrant;
            ret = iter.next(true);
            if (!this.gameObject.isInGame()) {
                leftGalaxy = true;
                this.die();
                break;
            }
            if(this.gameObject.quadrant.hasSupernova) {
                destroyed = true;
                quadrantWithSupernova = this.gameObject.quadrant;
                this.die();
                break;
            }
            if (prevQuad !== this.gameObject.quadrant) {
                this.visited.push(this.gameObject.quadrant);
            }
            if(this.armed && this.gameObject.quadrant === this.destinationQuadrant) {
                // if there's a star here make it supernova
                let stars = this.gameObject.quadrant.container.getGameObjectsOfType(Star);
                if(stars.length > 0) {
                    stars[0].goSupernova();
                }
                this.die();
                break;
            }
        } while (!ret.done);

        // do scans
        this.visited.forEach(q => this.starChart.probeScan(q));

        // make announcements
        this.visited.forEach(q => {
            let c = q.center;
            this.terminal.printLine(`Lt. Uhura- "The deep space probe is now in Quadrant ${c.userQuadrantX} - ${c.userQuadrantY}."`);
        });
        this.clearVisited();
        if(leftGalaxy) {
            this.terminal.printLine(`Lt. Uhura- "The deep space probe has left the Galaxy."`);
        } else if (destroyed && quadrantWithSupernova && quadrantWithSupernova instanceof Quadrant) {
            let c = quadrantWithSupernova.center;
            this.terminal.printLine(`Lt. Uhura- "The deep space probe was destroyed in a supernova at Quadrant ${c.userQuadrantX} - ${c.userQuadrantY}"`);
        }
    }

    die() {
        this.gameObject.removeSelf();
        this.clock.unregister(this.onTimeElapse);
    }
}


export class ProbeLauncher extends Device {
    constructor(parent, terminal, clock, starChart, count = 3) {
        super(parent, probeLauncherType);
        this._probes = count;
        this.terminal = terminal;
        this.clock = clock;
        this.starChart = starChart;
        this.probeWarpFactor = 10;

        // can be armed
        // flies off in a direction

        // possibly launches telemetry probes (?)
    }

    launchProbe(coordinates, destinationQuadrant, armed) {
        this.checkDamage();
        if (this._probes <= 0) return;

        // basically the same as the torpedo stuff
        let probe = new Probe(armed, this.clock, this.terminal, this.starChart, this.probeWarpFactor);
        // place probe
        let go = this.parent.gameObject;
        probe.gameObject.placeIn(go.galaxy, go.quadrant, go.sector);
        probe.launchToward(coordinates, destinationQuadrant);
        this._probes--;
    }

    static get propName() {
        return 'probeLauncher';
    }
}