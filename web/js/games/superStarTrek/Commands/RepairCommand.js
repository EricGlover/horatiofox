import {Command, INSTANT_SHIP_COMMAND} from "./Command.js";
import {
    REPAIR_STRATEGY_EVEN,
    REPAIR_STRATEGY_LEAST,
    REPAIR_STRATEGY_MOST,
    REPAIR_STRATEGY_PRIORITY
} from "../Devices/Devices.js";
import {Utility} from "../utils/Utility.js";
import {Device} from "../Devices/Devices";

export class RepairCommand extends Command {
    constructor(terminal, player, game) {
        super('rep', 'repair', 'set repair mode', INSTANT_SHIP_COMMAND);
        this.terminal = terminal;
        this.player = player;
        this.game = game;
        this._setRepairMode = this.addMode("mode", "setRepairMode", "m", "mode");
        this._setRepairMode.options.addOption('even', 'e', 'even');
        this._setRepairMode.options.addOption('least', 'l', 'least');
        this._setRepairMode.options.addOption('most', 'm', 'most');
        this._setRepairMode.options.addOption('priority', 'p', 'priority');
        this._setRepairPriorityMode = this.addMode('priority', "setRepairPriority", "set-priority", "p", "priority");
        this._repairDeviceMode = this.addMode("device", 'device', 'd', 'device');
        this._info = `
When your systems are damaged your repair crews will run about the ship repairing systems. This happens 
when time elapses; for example, by using the rest command, or by moving about the galaxy.

The 'repair' command allows you to control how your repair crews spend their time. If the repair mode is 
set to 'even', 'least', or 'most' your repair crews will repair devices based on how damaged the device is. Sometimes 
this is insufficient though so you can specify priorities for each device (I'd set life support to be the highest 
priority for example). Then if the repair mode is set to 'priority' your repair crews will repair higher priority 
devices first.
    
Examples : 
    repair mode even
    repair set-priority
    
Mode 1: "mode" - Setting your repair mode
    "even"  - tell repair crews to spread their time evenly across all damaged devices
    "least" - tell repair crews to repair the least damaged devices first
    "most"  - tell repair crews to repair the most damaged devices first
    "priority" (alias "p")    - tell repair to repair devices by their priorities
  
Mode 2: "priority" - REPAIR set priority 
    This is how you set the priorities for your devices. You'll be asked to give a repair priority (a number 1 - # of devices) for each device. Lower numbers are higher priority.
    If multiple devices have the same priority repair time will be split evenly amongst them.

Mode 3: "device" - Repair specific devices immediately
    If you want to rest until some devices are repaired you can do so with this mode. You'll be given a list of devices to choose from, and 
    you can choose multiple devices if you wish. You'll then rest until the repairs are finished.
`;
    }

    async setRepairPriority() {
        // todo:: consider printing off the current priorities

        // go through each device
        let devices = this.player.deviceContainer.getDevices();
        for (let i = 0; i < devices.length; i++) {
            let device = devices[i];
            let priority = this.player.deviceContainer.getDeviceRepairPriority(device.type);
            this.terminal.printLine(`${device.type.name}'s priority is currently ${priority}.`);
            let validResponse = false;
            let newPriority;
            while (!validResponse) {
                let response = await this.terminal.ask(`Set ${device.type.name} priority to : `);
                newPriority = Number.parseInt(response);
                if (Number.isNaN(newPriority) || newPriority < 0) {
                    this.terminal.printLine("Beg pardon, Captain?");
                } else {
                    validResponse = true;
                }
            }
            this.player.deviceContainer.setRepairPriority(device.type, newPriority);
        }
    }

    async setRepairMode(args) {
        let {even, least, most, priority} = this._setRepairMode.options.parseOption(args);

        if (even) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_EVEN);
        } else if (least) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_LEAST);
        } else if (most) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_MOST);
        } else if (priority) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_PRIORITY);
        } else {
            // ask if they want to cancel
            // else try interactive mode
            let str = Utility.quoteListAndAddOr(this._setRepairMode.options.getOptionNames());
            this.terminal.printLine(`repair mode not recognized (must be ${str})`);
            let cancel = await this.getConfirmation(this.terminal, `Cancel command?`);
            if (cancel) return;
            await this.interactiveMode();
        }
    }

    async interactiveMode() {
        // ask which mode they want to run : set repair mode, set priority, or repair devices
        let repairMode = await this.getConfirmation(this.terminal, `Would you like to set the repair mode?`);
        if (repairMode) {
            let current = this.player.deviceContainer.getRepairMode();
            this.terminal.printLine(`Current repair mode: ${current}`);
            // get args for repair mode
            let str = Utility.quoteListAndAddOr(this._setRepairMode.options.getOptionNames());
            let response;
            let valid = false;
            do {
                response = await this.terminal.ask(`Choose a repair mode (options: ${str}) : `);
                response = response.split(" ");
                let {even, least, most, priority} = this._setRepairMode.options.parseOption(response);
                if (!even && !least && !most && !priority) {
                    let cancel = await this.getConfirmation(this.terminal, `Cancel command?`);
                    if (cancel) return;
                } else {
                    valid = true;
                }
            } while (!valid);
            return await this.setRepairMode(response);
        }

        //
        let setPriority = await this.getConfirmation(this.terminal, `Would you like to set the repair priorities of ship devices?`);
        if (setPriority) {
            return await this.setRepairPriority();
        }

        ///
        let device = await this.getConfirmation(this.terminal, `Would you like to repair specific devices?`);
        if (device) {
            return this.repairDevice();
        } else { // cancel or repeat
            let cancel = await this.getConfirmation(this.terminal, `Cancel command?`);
            if (cancel) return;
            return await this.interactiveMode();
        }
    }

    // print off list of devices and ask them to choose which to repair
    // list also has the repair times needed
    async repairDevice() {
        this.terminal.printLine(`You have ${this.game.timeRemaining.toFixed(1)} days remaining.`);
        this.terminal.skipLine(1);

        let report = [
            ['#', 'Device', `Repair Time(${this.player.docked ? 'Docked' : 'In flight'})`]
        ];

        //
        let sortedDevices = this.player.deviceContainer.devices.slice();
        sortedDevices.sort((a, b) => a.name.localeCompare(b.name));
        let deviceData = sortedDevices.map((d, i) => {
            let time = '';
            if (this.player.docked) {
                time = d.timeToRepairAtDock();
            } else {
                time = d.timeToRepairInFlight();
            }
            return [
                `${i + 1}`,
                d.name,
                time.toFixed(1)
            ];
        });
        report.push(...deviceData);
        report.push([`${sortedDevices.length + 1}`, 'Cancel Command', 'N/A']);

        report = this.terminal.formatGrid(report, false, null, true);
        let str = this.terminal.joinGrid(report, "   ");
        this.terminal.printLine(str);
        let valid = false;
        let chosenDevices;
        do {
            // don't re-print the list after an incorrect response
            let response = await this.terminal.ask('Which device(s) would you like to repair? (Enter the #s) > ');
            let nums = response.split(' ');
            nums = nums.map(n => Number.parseInt(n)).filter(n => !Number.isNaN(n) && n > 0 && n <= sortedDevices.length + 1);

            if (nums.length === 0 || nums.some(n => n === sortedDevices.length + 1)) { // if no valid numbers, or they had a cancel command
                let cancel = await this.getConfirmation(this.terminal, `Cancel Command? `);
                if (cancel) return;
            } else {
                // if valid get the devices
                chosenDevices = nums.map(n => sortedDevices[n - 1]).filter(d => d instanceof Device);
                if (chosenDevices.length === 0) {
                    this.terminal.printLine('Beg pardon, Captain?');
                    return this.interactiveMode();
                } else {
                    valid = true;
                }
            }
        } while (!valid);
        // compute time, round possible floating point math errors away
        let time = chosenDevices.reduce((carry, d) => {
            if (this.player.docked) return carry + d.timeToRepairAtDock();
            return carry + d.timeToRepairInFlight();
        }, 0);
        time = Utility.ceilFloatAtFixedPoint(time, 2);

        //format the names
        let names = chosenDevices.map(d => d.name);
        names = Utility.listPrefixLast(names, 'and').join(", ");
        this.terminal.printLine(`Repairing ${names} will take a total of ${time.toFixed(1)} day(s).`);

        // check if time is going to run out
        if (time > this.game.timeRemaining) {
            this.terminal.printLine(`We only have ${this.game.timeRemaining.toFixed(1)} days remaining, if we rest that long the Klingons invasion will succeed.`);
        }

        // confirm rest for however many days
        let y = await this.getConfirmation(this.terminal, `Rest for ${time.toFixed(1)} days?`);
        if (!y) {
            let cancel = await this.getConfirmation(this.terminal, `Cancel Command? `);
            if (cancel) return;
            this.repairDevice();
        }

        // set device container to repair this specific device
        this.player.deviceContainer.repairDevicesNext(chosenDevices);
        // elapse time
        this.game.clock.elapseTime(time);
    }

    async run() {
        let args = this.terminal.getArguments();
        let {setRepairMode, setRepairPriority, device} = this.parseMode(args);
        if (!setRepairMode && !setRepairPriority && !device) {
            await this.interactiveMode();
        } else if (setRepairMode) {
            await this.setRepairMode(args);
        } else if (setRepairPriority) {
            // begin interactive questioning
            await this.setRepairPriority();
        } else if (device) {
            await this.repairDevice();
        }
    }
}