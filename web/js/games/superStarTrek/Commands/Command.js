// same thing as the regexifier but with the end of line character added
// so that you when we break apart the command by \s it identifies it correctly
import {Terminal} from "../Terminal.js";
import {Device} from "../Devices/Devices.js";

export function optionRegexifier(...strings) {
    strings = strings.sort((a, b) => b.length - a.length);
    strings = strings.map(str => str + "\\s*"); // 0 or more white space characters
    return new RegExp(`^\\s*(${strings.join("|")})\\s*$`, 'i');
}


// handy function for taking a bunch of strings that work as aliases and
// making a regex to match any of them that begin a string
export function regexifier(...strings) {
    // sort the possible command names by length that way
    // it'll match the longest possible thing first
    strings = strings.sort((a, b) => b.length - a.length);
    strings = strings.map(str => str + "(\\s+|$)"); // one or more white space characters
    // otherwise p is matched when given the word "photons"
    // the capture group is so that "p" with no whitespace is still matched
    return new RegExp(`^\\s*(${strings.join("|")})\\s*`, 'i');
}

export const INFO_COMMAND = "info";
export const ATTACK_COMMAND = "attack";
export const MOVE_COMMAND = "move";
export const TIME_EXPENDING_SHIP_COMMAND = "not instant ship command";
export const INSTANT_SHIP_COMMAND = "instant ship command";

class OptionsComponent {
    constructor(parent) {
        this.parent = parent;
        this.parent.options = this;
        this.options = {}; // name => {regex: /regex/, matches: string[]}
    }

    // makes an option for you
    addOption(name, ...matchingStrs) {
        this.options[name] = {
            regex: optionRegexifier(...matchingStrs),
            matches: matchingStrs
        };
    }

    // one of the arguments given matches some option regex then option
    // is true
    // returns map of options {optionName => found, ...}
    parseOption(args) {
        if (typeof args === 'string') args = args.split(" ");
        let matched = {};
        Object.keys(this.options).forEach(prop => {
            matched[prop] = args.some(str => this.options[prop].regex.test(str));
        });
        return matched;
    }

    stripOptions(args) {
        return args.filter(arg => {
            return !Object.keys(this.options).some(prop => this.options[prop].regex.test(arg));
        });
    }

    getOptionNames() {
        return Object.keys(this.options);
    }
}

class Mode {
    constructor(name, regex, matches, isDefault = false, requiredDevices = []) {
        this.name = name;
        this.regex = regex;
        this.matches = matches;
        this.requiredDevices = requiredDevices;
        this.options = new OptionsComponent(this);
        this.isDefault = isDefault;
    }

    addRequiredDevice(...devices) {
        if (devices.some(d => !(d instanceof Device))) throw new Error('Mode requires devices be passed in.');
        this.requiredDevices.push(...devices);
    }

    areRequiredDevicesFunctional() {
        return this.requiredDevices.every(d => !d.isDamaged());
    }

    getDamagedDeviceError() {
        let damaged = this.requiredDevices.filter(d => d.isDamaged());
        if (damaged.length > 1) {
            return `Required devices are damaged : ${damaged.map(d => d.name).join(", ")} .`;
        } else if (damaged.length === 1) {
            return `Required device is damaged : ${damaged[0].name}.`;
        }
        return '';
    }
}

export class Command {
    constructor(abbreviation, name, fullName, type) {
        // defaults
        this.abbreviation = abbreviation;
        this.name = name;
        this.fullName = fullName.split(" ").join("-");
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.type = type;
        this._info = "No info.";
        this.options = new OptionsComponent(this);
        this.modes = {};    // name => {regex: /regex/, matches: string[]}
        this.requiredDevices = [];
        this.active = true;
        this.syntax = [];
    }

    addRequiredDevice(...devices) {
        if (devices.some(d => !(d instanceof Device))) throw new Error('Command requires devices be passed in.');
        this.requiredDevices.push(...devices);
    }

    areRequiredDevicesFunctional() {
        return this.requiredDevices.every(d => !d.isDamaged());
    }

    getDamagedDeviceError() {
        let damaged = this.requiredDevices.filter(d => d.isDamaged());
        if (damaged.length > 1) {
            return `Required devices are damaged : ${damaged.map(d => d.name).join(", ")} .`;
        } else if (damaged.length === 1) {
            return `Required device is damaged : ${damaged[0].name}.`;
        }
        return '';
    }

    getMode(name) {
        return this.modes[name];
    }

    getActiveMode() {
        return this.modes.find(m => m.active);
    }

    // makes a mode for you
    // name <string> name to display to user in help menu
    // propName <string> propName to be returned with this.getMode()
    // ...matchingStrings strings that match this mode
    addMode(name, propName, isDefault, ...matchingStrs) {
        this.modes[name] = new Mode(name, optionRegexifier(...matchingStrs), matchingStrs, isDefault);
        return this.modes[name];
    }

    stripModes(args) {
        return args.filter(arg => {
            return !Object.keys(this.modes).some(prop => this.modes[prop].regex.test(arg));
        });
    }

    stripModeAndOptions(args) {
        return this.stripModes(this.options.stripOptions(args));
    }

    // the first argument given matches a mode regex then mode is true
    // returns map of modes {modeName => found, ...}
    parseMode(args) {
        let matched = {};
        Object.keys(this.modes).forEach(prop => {
            let isMatch = this.modes[prop].regex.test(args[0]);
            matched[prop] = isMatch;
            this.modes[prop].active = isMatch;
        });
        return matched;
    }

    /** Command Type functions **/
    isInstantShipCommand() {
        return this.type === INSTANT_SHIP_COMMAND;
    }

    isInfoCommand() {
        return this.type === INFO_COMMAND;
    }

    isAttackCommand() {
        return this.type === ATTACK_COMMAND;
    }

    isMoveCommand() {
        return this.type === MOVE_COMMAND;
    }

    get info() {
        return this.makeInfo() + this._info;
    }

    makeInfo() {
        let arr = [
            ['Abbreviation', this.abbreviation, ''],
            ['Name', this.name, ''],
            ['Full Name', this.fullName, ''],
            ['', '', '']
        ];
        if (Object.keys(this.modes).length > 0) {
            let rows = [
                ['Modes', 'Aliases', 'Is Default']
            ];
            Object.entries(this.modes).forEach(([k, v], i) => {
                rows.push([`  ${i + 1}) ${k}`, v.matches.join(", "), v.isDefault ? 'Yes' : 'No']);
            });
            arr.push(...rows);
        }

        if (Object.keys(this.options.options).length > 0) {
            let rows = [
                ['Options', '', '']
            ];
            Object.entries(this.options.options).forEach(([k, v], i) => {
                rows.push([`  ${i + 1}) ${k}`, v.matches.join(", "), '']);
            });
            arr.push(...rows);
        }
        let grid = Terminal.formatGrid(arr, false, null, true);
        return Terminal.joinGrid(grid, "    ");
    }

    async getInt(terminal, question) {
        let valid = false;
        let response;
        do {
            response = await terminal.ask(question);
            response = Number.parseInt(response);
            valid = !Number.isNaN(response);
            if (!valid) {
                terminal.printLine("Please provide an integer value.");
            }
        } while (!valid);
        return response;
    }

    async getFloats(terminal, question, n = 1) {
        let valid = false;
        let floats;
        do {
            let response = await terminal.ask(question);
            response = response.split(' ').map(n => Number.parseFloat(n)).filter(n => !Number.isNaN(n));
            if (response.length < n) {
                terminal.printLine(`Please provide ${n} space separated number(s) (decimal or integer).`);
            } else {
                valid = true;
                floats = response;
            }
        } while (!valid);
        return floats;
    }

    /**
     * Ask a yes / no question get a boolean answer
     * @param terminal
     * @param question
     * @returns {Promise<boolean>}
     */
    async getConfirmation(terminal, question) {
        let response;
        let yes = /(yes|y)/i;
        let no = /(no|n)/i;
        do {
            response = await terminal.ask(question);
            yes = /(yes|y)/i;
            no = /(no|n)/i;
        } while (!yes.test(response) && !no.test(response));
        return yes.test(response);
    }

    // async ask(terminal, question, validator) {
    //     if(typeof validator !== 'function') throw new Error("ask requires a validator function.");
    //     let response;
    //     do {
    //         response = await terminal.ask(question);
    //     } while (!validator(response));
    //     return response;
    // }
}