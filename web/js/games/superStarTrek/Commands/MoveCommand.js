import {Command, regexifier, MOVE_COMMAND} from "./Command.js";
import {Coordinates} from "../Space/Coordinates.js";
import {Sector} from "../Space/Sector.js";

export class MoveCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.abbreviation = "m";
        this.name = "move";
        this.fullName = "move under warp drive";
        this.regex = regexifier(this.abbreviation, this.name);
        this.type = MOVE_COMMAND;
        this.addOption('manual', 'm', 'manual');
        this.addOption('automatic', 'a', 'automatic');
        this.addOption('impulse', 'i', 'impulse');
        this.useImpulse = false;
        this.info = `  Mnemonic:  MOVE
  Shortest abbreviation:  M
  Full command:  MOVE MANUAL [displacement] [impulse]
                 MOVE AUTOMATIC [destination] [impulse]

This command is the usual way to move from one place to another
within the galaxy.  You move under warp drive, according to the
current warp factor (see "WARP FACTOR").

There are two command modes for movement: MANUAL and AUTOMATIC.  The
manual mode requires the following format:

        MOVE MANUAL [deltax] [deltay]

[deltax] and [deltay] are the horizontal and vertical displacements
for your starship, in quadrants; a displacement of one sector is 0.1
quadrants.  Specifying [deltax] and [deltay] causes your ship to move
in a straight line to the specified destination. If [deltay] is
omitted, it is assumed zero. For example, the shortest possible
command to move one sector to the right would be

        M M .1

The following examples of manual movement refer to the short-range
scan shown earlier.

  Destination Sector    Manual Movement command
        3 - 1                   M M -.3 -.1
        2 - 1                   M M -.3
        1 - 2                   M M -.2 .1
        1 - 4                   M M 0 .1
  (leaving quadrant)            M M 0 .2


The automatic mode is as follows:

        MOVE AUTOMATIC [qrow] [qcol] [srow] [scol]

where [qrow] and [qcol] are the row and column numbers of the
destination quadrant, and [srow] and [scol] are the row and column
numbers of the destination sector in that quadrant.  This command also
moves your ship in a straight line path to the destination.  For
moving within a quadrant, [qrow] and [qcol] may be omitted. For
example, to move to sector 2 - 9 in the current quadrant, the
shortest command would be

        M A 2 9

To move to quadrant 3 - 7, sector 5 - 8, type

        M A 3 7 5 8

and it will be done.  In automatic mode, either two or four numbers
must be supplied.
\f                                                                       10
Automatic mode utilizes the ship's "battle computer."  If the
computer is damaged, manual movement must be used.

If warp engines are damaged less than 10 stardates (undocked) you can
still go warp 4.

It uses time and energy to move.  How much time and how much energy
depends on your current warp factor, the distance you move, and
whether your shields are up.  The higher the warp factor, the faster
you move, but higher warp factors require more energy.  Specifically, 
    energy required = distance in terms of quadrants * (warpFactor ^ 3)
You may move with your shields up, but this doubles the energy required. 


You can move within a quadrant without being attacked if you just
entered the quadrant or have bee attacked since your last move
command.  This enables you to move and hit them before they
retaliate.

====When using Impulse Engines =====
The impulse engines give you a way to move when your warp engines are
damaged.  They move you at a speed of 0.95 sectors per stardate,
which is the equivalent of a warp factor of about 0.975, so they are
much too slow to use except in emergencies.

Movement commands are indicated just as in the "MOVE" command.

The impulse engines require 20 units of energy to engage, plus 10
units per sector (100 units per quadrant) traveled. It does not cost
extra to move with the shields up.`;
    }

    async moveTo(sector) {
        let enginesToUse = this.player.warpEngines;
        if (this.useImpulse) enginesToUse = this.player.impulseEngines;

        // how do they do collisions ?
        // check path for objects
        // calculate distance, energy required and time expended
        let distance = Galaxy.calculateDistance(this.player.gameObject.sector, sector);
        let energy = enginesToUse.calculateEnergyUsage(distance);

        // check power requirements
        if (this.player.powerGrid.energy < energy) {
            /** todo::
             * Engineering to bridge--
             We haven't the energy, but we could do it at warp 6,
             if you'll lower the shields.
             */
            this.terminal.printLine('Engineering to bridge--');
            this.terminal.printLine(`We haven't the energy for that.`);
            return;
        }

        // check time requirements
        let timeRequired = enginesToUse.calculateTimeRequired(distance);
        // if the move takes 80% or greater of the remaining time then warn them
        let percentOfRemaining = 100 * timeRequired / this.game.timeRemaining;
        if (percentOfRemaining > 80.0) {
            let proceed = await this.getConfirmation(this.terminal, `First Officer Spock- "Captain, I compute that such
  a trip would require approximately ${percentOfRemaining.toFixed(2)}% of our
  remaining time.  Are you sure this is wise?"`);

            if (proceed) {
                this.terminal.printLine("To boldly go...");
            } else if (!proceed) {
                this.terminal.printLine("Cancelling move.");
                return;
            }
        }

        // check for damaged systems, suggest alternatives if possible
        if (this.player.impulseEngines.isDamaged() && this.player.warpEngines.isDamaged()) {
            this.terminal.printLine(`Scotty- "Captain, our warp engines and impulse engines are both damaged. We can't move until one of them is repaired."`);
            return;
        }

        if (!this.useImpulse && this.player.warpEngines.isDamaged()) {
            let proceed = await this.getConfirmation(this.terminal, `Scotty- "Warp Engines are damaged, shall we proceed at impulse instead?"`);

            if (proceed) {
                this.terminal.printLine("Aye, Captain. Engaging impulse engines.");
                this.useImpulse = true;
            } else if (!proceed) {
                this.terminal.printLine("Cancelling move.");
                return;
            }
        }

        if (this.useImpulse && this.player.impulseEngines.isDamaged()) {
            let proceed = await this.getConfirmation(this.terminal, `Scotty- "Impulse Engines are damaged, shall we use warp engines instead?"`);

            if (proceed) {
                this.terminal.printLine("Aye, Captain. Engaging warp engines.");
                this.useImpulse = false;
            } else if (!proceed) {
                this.terminal.printLine("Cancelling move.");
                return;
            }
        }

        // do the move
        if (this.useImpulse) {
            this.player.impulseTo(sector);
        } else {
            this.player.warpTo(sector);
        }

        // elapse time
        this.game.clock.elapseTime(timeRequired);
        // check bounds
        // compute deltaX and deltaY
        // if both === 0 do nothing
        // compute distance to travel
        // check resources (power & time)
        // if warp factor > 6
        // then calculate engine damage
        // calculate time warp if any
        // if time warps or engines take damage then check the travel path
        // for collisions
    }

    async run() {
        // sort out our target Sector to move to depending on the chosen mode
        // modes : manual and automatic
        // remove mode option from arguments, if provided
        let args = this.terminal.getArguments();
        let {manual, automatic, impulse} = this.getOption(args);
        this.useImpulse = impulse;
        if (!manual && !automatic) automatic = true;    // set a default

        let destination;
        if (manual) {
            // parse args, only two arguments
            if (args.length !== 2) {
                throw new Error("need y and x");
            }
            let [argX, argY] = args;
            // quadrant based args <deltaX> <deltaY>
            // fuck that I'm making them <deltaY> <deltaX> so that they're consistent
            let deltaQx = Math.trunc(argX);
            let deltaQy = Math.trunc(argY);
            let deltaSx = Math.trunc((argX * 10) % 10);
            let deltaSy = Math.trunc((argY * 10) % 10);

            // calculate the destination
            try {
                // convert to distance
                destination = this.player.mover.calculateDestination(deltaQx, deltaQy, deltaSx, deltaSy);
            } catch (e) {
                console.error(e);
            }
        } else if (automatic) {
            // parse args <quadY> <quadX> <sectorY> <sectorX>
            // or just <sectorY> <sectorX>
            args = args.map(str => Number.parseInt(str)).filter(num => !Number.isNaN(num));

            // make sure to convert from the 1 based commands
            // to the 0 based coordinates
            let quadX, quadY, sectorX, sectorY;
            let c;
            if (args.length === 4) {
                quadX = args[0];
                quadY = args[1];
                sectorX = args[2];
                sectorY = args[3];
                c = Coordinates.convert(quadX, quadY, sectorX, sectorY, this.galaxy);
            } else if (args.length === 2) {
                let quadrant = this.player.gameObject.quadrant;
                sectorX = args[0];
                sectorY = args[1];
                c = Coordinates.convert1(quadrant, sectorX, sectorY, this.galaxy);
            } else {
                this.terminal.printLine("Beg pardon, Captain?");
                return;
            }
            if (!this.galaxy.areValidCoordinates(c)) {
                this.terminal.printLine("Beg pardon, Captain?");
                return;
            }
            destination = this.galaxy.getSector(c);
        }

        // now that we have a target destination check that it exists
        if (!destination || !(destination instanceof Sector)) {
            this.terminal.printLine('Beg pardon, Captain?');
        }

        // now check that there's nothing already there
        // if there's something there, move us to an adjacent sector in the quadrant if possible
        // todo:: add ramming
        if (destination.isFull()) {
            let newDestination = destination.quadrant.getNearestEmptySectorAdjacentTo(destination);
            if (!newDestination) {
                this.terminal.printLine(`Computer error Captain, can't move there.`);
                console.error(`can't find adjacent sector`);
                return;
            }
            let thing = destination.container.getAllGameObjects().filter(obj => obj.collider)[0];
            this.terminal.printLine(`Sulu - "We managed to avoid the ${thing.name} at ${thing.gameObject.printSectorLocation()}."`);
            destination = newDestination;
        }

        try {
            await this.moveTo(destination);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}