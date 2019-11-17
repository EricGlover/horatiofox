import {Command, ATTACK_COMMAND, regexifier} from "./Command.js";
import {Coordinates} from "../Space/Coordinates";

export class PhotonsCommand extends Command {
    constructor(game, terminal, player) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "pho";
        this.name = "photon";
        this.fullName = "photon torpedoes";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName, "photons", "photon torpedo");
        this.deviceUsed = "";
        this.maxPerBurst = 3;
        this.options = {};
        this.type = ATTACK_COMMAND;
        this.info = `
  Mnemonic:  PHOTONS
  Shortest abbreviation:  PHO
  Full commands:  PHOTONS <NUMBER> <TARG1> <TARG2> <TARG3>

Photon torpedoes are projectile weapons--you either hit what you aim
at, or you don't.  There are no "partial hits".

One photon torpedo will usually kill one ordinary Klingon, but it
usually takes about two for a Klingon Commander.  Photon torpedoes
can also blow up stars and starbases, if you aren't careful.

You may fire photon torpedoes singly, or in bursts of two or three.
Each torpedo is individually targetable.  The computer will prompt
you, asking for the target sector for each torpedo.  Alternately, you
may specify each target in the command line.

Photon torpedoes cannot be aimed precisely--there is always some
randomness involved in the direction they go.  Photon torpedoes may
be fired with your shields up, but as they pass through the shields
they are randomly deflected from their intended course even more.

Photon torpedoes are proximity-fused.  The closer they explode to the
enemy, the more damage they do.  There is a hit "window" about one
sector wide.  If the torpedo misses the hit window, it does not
explode and the enemy is unaffected.  Photon torpedoes are only
effective within the quadrant.  They have no effect on things in
adjacent quadrants.

If more than one torpedo is fired and only one target sector is
specified, all torpedoes are fired at that sector.  For example, to
fire two torpedoes at sector 3 - 4, you type

     PHO 2 3 4           (or)           PHO 2 3 4 3 4

To fire torpedoes at, consecutively, sectors 2 - 6, 1 - 10, and 4 -
7, type

     PHO 3 2 6 1 10 4 7

There is no restriction to fire directly at a sector.  For example,
you can enter

       PHO 1 3 2.5

to aim between two sectors.  However, sector numbers must be 1 to 10
inclusive.

`;
    }

    run() {
        // torpedo launcher is damaged
        if (this.player.photons.isDamaged()) {
            this.terminal.echo(`Torpedo launcher is damaged.`);
            return;
        }

        let args = this.terminal.getArguments();
        let number = args.shift();
        let targets = [];
        for (let i = 0; i < args.length; i += 2) {
            let x = Number.parseFloat(args[i]);
            let y = Number.parseFloat(args[i + 1]);
            if (Number.isNaN(x) || Number.isNaN(y)) {
                this.terminal.echo(`${x} or ${y} is not a number.`);
                return;
            }
            // check that those sector numbers make sense ???
            targets.push({x, y});
        }

        if (number > this.maxPerBurst) {
            this.terminal(`Maximum of ${this.maxPerBurst} torpedoes per burst.`);
            // todo:: supposed to go into interactive mode
            return;
        }

        // if number and args don't match
        if (targets.length === 1) {  // assume all torpedoes will be launched at same target
            // make copies
            while (targets.length < number) {
                let copy = Object.assign({}, targets[0]);
                targets.push(copy);
            }
        } else if (number < targets.length) {
            this.terminal.echo("Please specify destinations for every torpedo.");
            return;
        } else if (number > targets.length) {
            this.terminal.echo("Number of targets and the number to launch don't match.");
            return;
        }

        // not enough torpedoes
        let torpedoCount = this.player.photons.getTorpedoCount();
        if (number > torpedoCount) {
            this.terminal.echo(`You only have ${torpedoCount} torpedoes.`);
            return;
        }

        // convert coordinates
        targets = targets.map(target => {
            return Coordinates.convert1(this.player.gameObject.quadrant, target.x, target.y);
        });

        // fire photon torpedoes
        targets.forEach((target, i) => {
            this.terminal.echo(`\nTrack for torpedo number ${i + 1}:  `);
            this.player.photons.fire(target)
        });
    }
}