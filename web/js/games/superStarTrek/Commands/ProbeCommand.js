import {Command, regexifier} from "./Command.js";
import {TIME_EXPENDING_SHIP_COMMAND} from "./Command";
import {Coordinates} from "../Space/Coordinates";

export class ProbeCommand  extends Command {
    constructor(terminal, player, galaxy) {
        super('pr', 'probe', 'launch probe', TIME_EXPENDING_SHIP_COMMAND);
        this.galaxy = galaxy;
        this.terminal = terminal;
        this.player = player;
        this.addOption('armed', 'armed', 'a');
        this._info = `
Full command:  PROBE [ARMED] [quadrant x] [quadrant y]

The Enterprise carries a limited number of Long Range Probes. These
fly to the end of the galaxy and report back a count of the number of
important things found in each quadrant through which it went. The
probe flies at warp 10, and therefore uses time during its flight.
Results are reported immediately via subspace radio and are recorded
in the star chart.

The probe can also be armed with a NOVAMAX warhead. When launched
with the warhead armed, the probe flies the same except as soon as it
reaches the target location, it detonates the warhead in the heart of
a star, causing a supernova and destroying everything in the
quadrant. It then flies no further. There must be a star in the
target quadrant for the NOVAMAX to function.

The probe can fly around objects in a galaxy, but is destroyed if it
enters a quadrant containing a supernova, or if it leaves the galaxy.`
    }

    run() {
        if(this.player.probeLauncher.isDamaged()) {
            this.terminal.printLine("Probe Launcher is damaged");
            return;
        }
        let args = this.terminal.getArguments();
        let {armed} = this.parseOption(args);
        let qx, qy;
        let nums = [];
        for(let i = 0; i < args.length; i++) {
            let num = Number.parseInt(args[i]);
            if(!Number.isNaN(num)) {
                nums.push(num);
            }
        }
        if(nums.length < 2) {
            this.terminal.printLine("Beg pardon, Captain?");
            return;
        }
        qx = nums[0];
        qy = nums[1];

        let c = Coordinates.convert(qx, qy, 5, 5, this.galaxy);
        // check validity
        if(!this.galaxy.areValidCoordinates(c)) {
            this.terminal.printLine("Beg pardon, Captain?");
            return;
        }
        //get quadrant
        let dest = this.galaxy.getQuadrant(c);
        this.player.probeLauncher.launchProbe(c, dest, armed);
    }
}