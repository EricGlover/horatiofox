// todo:: make command classes
import {Command, regexifier, optionRegexifier, INSTANT_SHIP_COMMAND} from "./Command.js";
import {REPAIR_STRATEGY_EVEN, REPAIR_STRATEGY_LEAST, REPAIR_STRATEGY_MOST, REPAIR_STRATEGY_PRIORITY} from "../Devices/Devices.js";

export class RepairCommand extends Command {
    constructor(terminal, player) {
        super();
        this.terminal = terminal;
        this.player = player;
        this.abbreviation = "rep";
        this.name = "repair";
        this.fullName = "set repair mode";
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.type = INSTANT_SHIP_COMMAND;
        this.addMode("setRepairMode", "m", "mode");
        this.addMode("setRepairPriority", "set-priority", "p", "priority");
        this.info = `
    Mnemonic: REPAIR
    Abbreviation: REP
    Syntax: 
        1) REPAIR mode [mode]
        2) REPAIR set-priority
        
    Examples : 
        repair even
        repair set-priority
        
    Syntax 1) Setting your repair mode: 
        "even"  - tell repair crews to spread their time evenly across all damaged devices
        "least" - tell repair crews to repair the least damaged devices first
        "most"  - tell repair crews to repair the most damaged devices first
        "priority" (alias "p")    - tell repair to repair devices by their priorities
      
    Syntax 2) REPAIR set priority 
        This is how you set the priorities for your devices. You'll be asked to give a repair priority (a number 1 - # of devices) for each device. Lower numbers are higher priority.
        If multiple devices have the same priority repair time will be split evenly amongst them.    
        `;
    }

    async setRepairPriority() {
        // consider printing off the current priorities

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

    setRepairMode() {
        let args = this.terminal.getArguments();
        let argEven = optionRegexifier('e', 'even');
        let argLeast = optionRegexifier('l', 'least');
        let argMost = optionRegexifier('m', 'most');
        let argPrio = optionRegexifier('p', 'priority');
        if (argEven.test(args[1])) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_EVEN);
        } else if (argLeast.test(args[1])) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_LEAST);
        } else if (argMost.test(args[1])) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_MOST);
        } else if (argPrio.test(args[1])) {
            this.player.deviceContainer.setRepairMode(REPAIR_STRATEGY_PRIORITY);
        } else {
            this.terminal.printLine("repair mode not recognized (even, least, most, or priority is acceptable.)");
        }
    }

    async run() {
        let args = this.terminal.getArguments();
        let {setRepairMode, setRepairPriority} = this.getMode(args);
        if (setRepairMode) {
            this.setRepairMode();
        } else if (setRepairPriority) {
            // begin interactive questioning
            await this.setRepairPriority();
        } else {
            this.terminal.printLine("Beg pardon, Captain?");
            return;
        }
    }
}