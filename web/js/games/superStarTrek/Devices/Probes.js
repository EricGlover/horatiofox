import {Device, probeLauncherType} from "./Devices.js";
import {GameObject} from "../Components/GameObject";
import {Mover} from "../Components/Mover";


class Probe {
    constructor(armed, clock, warpFactor = 10) {
        this.gameObject = new GameObject(this, false);
        this.mover = new Mover(this, this.gameObject);
        this.armed = armed;
        this.clock = clock;
        this.warpFactor = warpFactor;
        this.destination = null;
    }

    launchToward(quadrant) {
        this.destination = quadrant;
        this.clock.register(this.onTimeElapse.bind(this));
    }

    onTimeElapse(days) {
        let distanceToTravel = this.mover.calculateDistance(days, this.warpFactor);

    }

    die() {
        this.gameObject.removeSelf();
    }
}


export class ProbeLauncher extends Device {
    constructor(parent, terminal, clock, subspaceRadio, count = 3) {
        super(parent, probeLauncherType);
        this._probes = count;
        this.terminal = terminal;
        this.clock = clock;
        this.probeWarpFactor = 10;

        // reports back to ship with subspace radio

        // can be armed
        // flies off in a direction
        // dies if moves into quadrant with a supernova
        // possibly launches telemetry probes (?)
    }

    launchProbe(quadrant, armed) {
        this.checkDamage();
        if (this._probes <= 0) return;

        // basically the same as the torpedo stuff
        let probe = new Probe(armed, this.clock, this.probeWarpFactor);
        // place probe
        let go = this.parent.gameObject;
        probe.gameObject.placeIn(go.galaxy, go.quadrant, go.sector);

        probe.launchToward(quadrant);
        this._probes--;
    }

    static get propName() {
        return 'probeLauncher';
    }
}