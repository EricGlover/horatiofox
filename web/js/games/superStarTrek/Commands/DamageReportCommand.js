import {Command, regexifier, INFO_COMMAND} from "./Command.js";

export class DamageReportCommand extends Command {
    constructor(game, terminal, player) {
        super('da', 'damages', 'damage report', INFO_COMMAND);
        this.game = game;
        this.terminal = terminal;
        this.player = player;
        this.regex = regexifier(this.abbreviation, this.name, "damage", this.fullName);
        this.addOption("alpha", "a", "alpha", "alphabetically");
        this.addOption("all", "all");
        this._info = ` 
Syntax: [command] (options)
example usage : 
    COMMAND> damage alpha    
    - sorted by alphabetically by device name
    COMMAND> da
    - sorted by time 
    COMMAND> da all
    - show all devices, sort by default (damage descending)

========    DETAILS =========    
At any time you may ask for a damage report to find out what devices
are damaged and how long it will take to repair them.  Naturally,
repairs proceed faster at a starbase.

If you suffer damages while moving, it is possible that a subsequent
damage report will not show any damage.  This happens if the time
spent on the move exceeds the repair time, since in this case the
damaged devices were fixed en route.

Damage reports are free.  They use no energy or time, and can be done
safely even in the midst of battle.`;
    }

    run() {
        // get sort option if any
        let {alpha, all} = this.getOption(this.terminal.getArguments());

        let sortedDevices = this.player.deviceContainer.devices.slice();
        if (alpha) { // sort alphabetically
            sortedDevices.sort((a, b) => a.name.localeCompare(b.name));
        } else {    // sort by damage
            sortedDevices.sort((a, b) => b.damage - a.damage);
        }

        // filter out non-damaged devices
        if (!all) {
            sortedDevices = sortedDevices.filter(d => d.damage > 0);
        }

        if (sortedDevices.length === 0) {
            this.terminal.skipLine(1);
            this.terminal.printLine("All systems operational.");
            this.terminal.skipLine(1);
            return;
        }
        this.terminal.skipLine(1);
        this.terminal.printLine(`Repair mode: ${this.player.deviceContainer.repairMode}`);
        let report = [
            ["", "", "", "-REPAIR TIMES-"],
            ["Priority", "DEVICE", "IN FLIGHT", "DOCKED"],
            ...sortedDevices.map(d => {
                return [
                    '' + this.player.deviceContainer.getDeviceRepairPriority(d.type),
                    d.name,
                    d.timeToRepairInFlight().toFixed(2),
                    d.timeToRepairAtDock().toFixed(2)
                ]
            })
        ];

        this.terminal.printLine(this.terminal.joinGrid(this.terminal.formatGrid(report, false, null, true), "  "));
        this.terminal.skipLine(1);
    }
}