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
Full commands:  PHOTONS (NUMBER) [coordinate 1] [coordinate 2] [coordinate 3]

Launches photon torpedoes at coordinates in the current quadrant.

You can launch up to 3 at a time. To launch specify the coordinates to fire at,
each coordinate is x then y.
Ex : 
COMMAND> photons 1 1 5 5
Launches 2 torpedoes, one to Sector 1 - 1, another to Sector 5 - 5

You can specify the number to fire if you'd like to launch multiple 
torpedoes at the same coordinates.
COMMAND> photons 3 5 5
Launches 3 torpedoes at Sector 5 - 5

Note: If you fire 3 torpedoes and only give two coordinates, the 
last coordinate is the one that will be fire at twice. 

You can specify coordinates between to sectors if you wish.
COMMAND> pho 5.5 5
Launches one torpedo in between sectors 5 - 5 and 6 - 5

Photon torpedoes are projectile weapons--you either hit what you aim
at, or you don't.  There are no "partial hits".

Photon torpedoes are proximity-fused. There is a hit "window" about one
sector wide.  If the torpedo misses the hit window, it does not
explode and the enemy is unaffected.  Photon torpedoes are only
effective within the quadrant.  They have no effect on things in
adjacent quadrants.`;
    }

    run() {
        // torpedo launcher is damaged
        if (this.player.photons.isDamaged()) {
            this.terminal.echo(`Torpedo launcher is damaged.`);
            return;
        }
        // parse args
        let args = this.terminal.getArguments();
        args = args.map(arg => Number.parseFloat(arg)).filter(arg => !Number.isNaN(arg));

        // figure out number to fire
        let number = Math.floor(args.length / 2);

        // if odd number of args then they provided a number to fire
        if (args.length % 2 !== 0) {
            number = args.shift();
        }

        // do some checks
        if (number > this.maxPerBurst) {
            this.terminal(`Maximum of ${this.maxPerBurst} torpedoes per burst.`);
            // todo:: supposed to go into interactive mode
            return;
        }

        // not enough torpedoes
        let torpedoCount = this.player.photons.getTorpedoCount();
        if (number > torpedoCount) {
            this.terminal.echo(`You only have ${torpedoCount} torpedoes.`);
            return;
        }

        // convert coordinates
        let coordinates = [];
        for (let i = 0; i + 1 < args.length; i += 2) {
            let c = Coordinates.convert1(this.player.gameObject.quadrant, args[i], args[i + 1]);
            coordinates.push(c);
        }

        // repeat targets if needed
        if (coordinates.length < number) {
            let diff = number - coordinates.length;
            let lastCord = coordinates[coordinates.length - 1];
            for (let i = 0; i < diff; i++) {
                coordinates.push(lastCord.clone());
            }
        }

        // fire photon torpedoes
        coordinates.forEach((c, i) => {
            this.terminal.echo(`\nTrack for torpedo number ${i + 1}:  `);
            this.player.photons.fire(c)
        });
    }
}