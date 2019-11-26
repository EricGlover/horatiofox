import {Command, ATTACK_COMMAND, regexifier} from "./Command.js";
import {Coordinates} from "../Space/Coordinates";

export class PhotonsCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super('pho', 'photon', 'photon torpedoes', ATTACK_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.regex = regexifier(this.abbreviation, this.name, this.fullName, "photons", "photon torpedo");
        this.deviceUsed = "";
        this.maxPerBurst = 3;
        this.options = {};
        this._info = `
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

    async runInteractive() {
        // get amount to fire
        let valid = false;
        let amountToFire;
        do {
            let burstAmount = this.player.photons.maxBurst;
            let count = this.player.photons.getTorpedoCount();
            let availableToFire = Math.min(count, burstAmount);
            let response = await this.getInt(this.terminal, `How many photon torpedoes would you like to fire? (maximum of ${availableToFire}) : `);
            if (response > count) {
                this.terminal.printLine(`You only have ${count} torpedoes available to fire.`);
            } else if (response > burstAmount) {
                this.terminal.printLine(`You can only fire ${burstAmount} at a time.`);
            } else if (response <= 0) {
                let cancel = this.getConfirmation(this.terminal, 'Cancel Command?');
                if (cancel) return;
            } else {
                valid = true;
                amountToFire = response;
            }
        } while (!valid);

        // get coordinates
        let coordinates = [];   // Coordinates[]
        while (coordinates.length < amountToFire) {
            let i = coordinates.length + 1;
            valid = false;
            do {
                // get 2 floats
                let floats = await this.getFloats(this.terminal, `Where would you like to fire torpedo #${i}? x y : `, 2);
                // valid coordinates (check with galaxy, and check that they're in the same quadrant)
                let c = Coordinates.convert1(this.player.gameObject.quadrant, floats[0], floats[1]);
                if (!this.galaxy.areValidCoordinates(c)) {
                    this.terminal.printLine(`${floats[0]} - ${floats[1]} is outside the galaxy.`);
                } else if (this.player.gameObject.quadrant !== this.galaxy.getQuadrant(c)) {
                    this.terminal.printLine(`${floats[0]} - ${floats[1]} is outside this quadrant.`);
                } else {
                    coordinates.push(c);
                    valid = true;
                }
            } while (!valid);
        }
        // confirm
        let locationStr = coordinates.map(c => `${c.userSectorXFloat.toFixed(1)} - ${c.userSectorYFloat.toFixed(1)}`).join(', ');
        let yes = await this.getConfirmation(this.terminal, `Fire ${coordinates.length} torpedoes at : ${locationStr} ?`);
        if (!yes) {
            let cancel = await this.getConfirmation(this.terminal, 'Cancel Command?');
            if (cancel) return;
            return this.runInteractive();
        }
        this.terminal.printLine("Firing torpedo(es)");

        // fire photon torpedoes
        coordinates.forEach((c, i) => {
            this.terminal.echo(`\nTrack for torpedo number ${i + 1}:  `);
            this.player.photons.fire(c)
        });
    }

    run() {
        // torpedo launcher is damaged
        if (this.player.photons.isDamaged()) {
            this.terminal.echo(`Torpedo launcher is damaged.`);
            return;
        } else if (this.player.photons.getTorpedoCount() < 1) {
            this.terminal.printLine(`Captain we're out of torpedoes.`);
            return;
        }

        // parse args
        let args = this.terminal.getArguments();
        args = args.map(arg => Number.parseFloat(arg)).filter(arg => !Number.isNaN(arg));

        if (args.length === 0) {
            return this.runInteractive();
        }

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

            // validate coordinates (check with galaxy, check that they're in this quadrant)
            if (!this.galaxy.areValidCoordinates(c)) {
                this.terminal.printLine(`${args[i]} - ${args[i + 1]} is outside of the galaxy. Skipping.`);
                number--;
            } else if (this.player.gameObject.quadrant !== this.galaxy.getQuadrant(c)) {
                this.terminal.printLine(`${args[i]} - ${args[i + 1]} is outside of this quadrant. Skipping.`);
                number--;
            } else {
                coordinates.push(c);
            }
        }

        if (number === 0 || coordinates.length === 0) {
            this.terminal.printLine(`All invalid coordinates, can't fire.`);
            return;
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