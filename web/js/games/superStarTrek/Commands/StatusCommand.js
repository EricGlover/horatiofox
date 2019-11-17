import {Command, regexifier, INFO_COMMAND} from "./Command.js";
import {AbstractKlingon} from "../Enemies/Enemies.js";

export class StatusCommand extends Command {
    constructor(game, terminal, player, galaxy) {
        super();
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.galaxy = galaxy;
        this.abbreviation = 'st';
        this.name = 'status';
        this.regex = regexifier("st", "status", "status report");
        this.fullName = 'status report';
        this.type = INFO_COMMAND;
        this.info = `Mnemonic:  STATUS
  Shortest abbreviation: ST

This command gives you information about the current state of your
starship as follows:

  STARDATE - The current date. A stardate is the same as a day.

  CONDITION - There are four possible conditions:
        DOCKED - docked at starbase.
        RED    - in battle.
        YELLOW - low on energy (<1000 units)
        GREEN  - none of the above

  POSITION - Quadrant is given first, then sector

  LIFE SUPPORT - If "ACTIVE" then life support systems are
        functioning normally. If on "RESERVES" the number is how many
        stardates your reserve food, air, etc. will last--you must
        get repairs made or get to starbase before your reserves run
        out.

  WARP FACTOR - What your warp factor is currently set to.

  ENERGY - The amount of energy you have left. If it drops to zero,
        you die.

  TORPEDOES - How many photon torpedoes you have left.

  SHIELDS - Whether your shields are up or down, how strong they are
       (what percentage of a hit they can deflect), and shield
       energy.

  KLINGONS LEFT - How many of the Klingons are still out there.

  TIME LEFT - How long the Federation can hold out against the
        present number of Klingons; that is, how long until the end
        if you do nothing in the meantime.  If you kill Klingons
        quickly, this number will go up--if not, it will go down.  If
        it reaches zero, the federation is conquered and you lose.

Status information is free--it uses no time or energy, and if you are
in battle, the Klingons are not given another chance to hit you.

Status information can also be obtained by doing a short-range scan.
See the SRSCAN command for details.

Each item of information can be obtained singly by requesting it.
See REQUEST command for details.`;
    }

    /**
     * If your short-range sensors are damaged, this command will only show
     the contents of adjacent sectors.
     #define IHQUEST '?'  // mystery quest
     #define IHF 'F'  // ????
     #define IHT 'T'  // ????
     #define IHWEB '#'
     #define IHGREEN 'G'
     #define IHYELLOW 'Y'
     #define IHRED 'R'
     #define IHDOCKED 'D'
     COMMAND> s
     */
    getStatusText(format = true) {
        if (format) {
            let collider = this.player.collider;
            let percent = collider.health * 100 / collider.maxHealth;

            let {qX, qY, sX, sY} = this.player.gameObject.getLocation();
            let position = `${qX} - ${qY}; ${sX} - ${sY}`;
            let lifeSupport = [`Life Support`, `NA`];
            if (this.player.lifeSupport.isOk()) {
                lifeSupport = [`Life Support`, `ACTIVE`];
            } else {
                lifeSupport = [`Life Support`, `DAMAGED, reserves = ${this.player.lifeSupport.reserves.toFixed(1)}`];
            }
            let warpFactor = [`Warp Factor`, `${this.player.warpEngines.warpFactor.toFixed(1)}`];
            let grid = this.player.powerGrid;
            let gridPercent = grid.energy * 100 / grid.capacity;
            let energy = [`Energy`, `${grid.energy.toFixed(2)}, ${gridPercent.toFixed(1)}%`];
            let torpedoes = [`Torpedoes`, `${this.player.photons.getTorpedoCount()}`];
            let shields = [`Shields`, `${this.player.shields.printInfo()}`];
            let klingonsRemaining = [`Klingons Left`, `${this.galaxy.container.getCountOfGameObjects(AbstractKlingon)}`];
            let timeLeft = [`Time Left`, `${this.game.timeRemaining.toFixed(2)}`];
            let matrix = [
                ['Stardate', this.game.clock.starDate.toFixed(1)],
                ['Condition', this.player.printCondition()],
                ['Hull Integrity', `${collider.health.toFixed(2)}, ${percent.toFixed(1)}%`],
                ['Position', position],
                lifeSupport,
                warpFactor,
                energy,
                torpedoes,
                shields,
                klingonsRemaining,
                timeLeft
            ];
            return this.terminal.formatGrid(matrix, false, null, true).map(arr => arr.join("   "));
        }
        let date = `Stardate\t${this.game.clock.starDate.toFixed(1)}`
        let condition = `Condition\t${this.player.printCondition()}`;
        let collider = this.player.collider;
        let percent = collider.health * 100 / collider.maxHealth;
        let hullIntegrity = `Hull Integrity\t${collider.health.toFixed(2)}, ${percent.toFixed(1)}%`;
        let {qX, qY, sX, sY} = this.player.gameObject.getLocation();
        let position = `${qX} - ${qY}; ${sX} - ${sY}`;
        let lifeSupport = `Life Support NA`;
        if (this.player.lifeSupport.isOk()) {
            lifeSupport = `Life Support\tACTIVE`;
        } else {
            lifeSupport = `Life Support\tDAMAGED, reserves = ${this.player.lifeSupport.reserves.toFixed(1)}`;
        }
        let warpFactor = `Warp Factor\t${this.player.warpEngines.warpFactor.toFixed(1)}`;
        let grid = this.player.powerGrid;
        let gridPercent = grid.energy * 100 / grid.capacity;
        let energy = `Energy\t\t${grid.energy.toFixed(2)}, ${gridPercent.toFixed(1)}%`;
        let torpedoes = `Torpedoes\t${this.player.photons.getTorpedoCount()}`;
        let shields = `Shields\t\t${this.player.shields.printInfo()}`;
        let klingonsRemaining = `Klingons Left\t${this.galaxy.container.getCountOfGameObjects(AbstractKlingon)}`;
        let timeLeft = `Time Left\t${this.game.timeRemaining.toFixed(2)}`;
        return [
            date,
            condition,
            position,
            lifeSupport,
            warpFactor,
            energy,
            hullIntegrity,
            torpedoes,
            shields,
            klingonsRemaining,
            timeLeft
        ];
    }

    run() {
        this.terminal.newLine();
        this.terminal.echo(this.getStatusText().join("\n"));
    }
}