// same thing as the regexifier but with the end of line character added
// so that you when we break apart the command by \s it identifies it correctly
import {Terminal} from "../Terminal";

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

export class Command {
    constructor(abbreviation, name, fullName, type) {
        // defaults
        this.abbreviation = abbreviation;
        this.name = name;
        this.fullName = fullName.split(" ").join("-");
        this.regex = regexifier(this.abbreviation, this.name, this.fullName);
        this.type = type;
        this.deviceUsed = "";
        this._info = "No info.";
        this.options = {};  // name => {regex: /regex/, matches: string[]}
        this.modes = {};    // name => {regex: /regex/, matches: string[]}
        this.active = true;
        this.syntax = [];
    }

    // makes an option for you
    addOption(name, ...matchingStrs) {
        this.options[name] = {
            regex: optionRegexifier(...matchingStrs),
            matches: matchingStrs
        };

    }

    // makes a mode for you
    addMode(name, ...matchingStrs) {
        this.modes[name] = {
            regex: optionRegexifier(...matchingStrs),
            matches: matchingStrs
        };

    }

    stripOptions(args) {
        return args.filter(arg => {
            return !Object.keys(this.options).some(prop => this.options[prop].regex.test(arg));
        });
    }

    stripModes(args) {
        return args.filter(arg => {
            return !Object.keys(this.modes).some(prop => this.modes[prop].regex.test(arg));
        });
    }

    stripModeAndOptions(args) {
        return this.stripModes(this.stripOptions(args));
    }

    // one of the arguments given matches some option regex then option
    // is true
    // returns map of options {optionName => found, ...}
    getOption(args) {
        let matched = {};
        Object.keys(this.options).forEach(prop => {
            matched[prop] = args.some(str => this.options[prop].regex.test(str));
        });
        return matched;
    }

    // the first argument given matches a mode regex then mode is true
    // returns map of modes {modeName => found, ...}
    getMode(args) {
        let matched = {};
        Object.keys(this.modes).forEach(prop => {
            matched[prop] = this.modes[prop].regex.test(args[0])
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
            ['Abbreviation', this.abbreviation],
            ['Name', this.name],
            ['Full Name', this.fullName]
        ];
        if(Object.keys(this.modes).length > 0) {
            let rows = [
                ['Modes', '']
            ];
            Object.entries(this.modes).forEach(([k, v], i) => {
                rows.push([`  ${i + 1}) ${k}`, v.matches.join(", ")]);
            });
            arr.push(...rows);
            // let row = ['Modes', Object.keys(this.modes).join(", ")];
            // arr.push(row);
        }

        if(Object.keys(this.options).length > 0) {
            let rows = [
                ['Options', '']
            ];
            Object.entries(this.options).forEach(([k, v], i) => {
                rows.push([`  ${i + 1}) ${k}`, v.matches.join(", ")]);
            });
            arr.push(...rows);
            // let row = ['Options', Object.keys(this.options).join(", ")];
            // arr.push(row);
        }
        let grid = Terminal.formatGrid(arr, false, null, true);
        return Terminal.joinGrid(grid, "    ");
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
}