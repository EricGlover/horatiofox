import GlobalErrorHandler from "../../components/Errors.js";
import Navbar from "../../components/Navbar.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

import "../../../lib/ptty.jquery.js";
import Game from "./Game.js";
import Menu from "./Menu.js";
import {terminal} from './Terminal.js';
import Tests from './Tests.js';

export const DEBUG = true;
const RUN_TESTS = false;
export const LAST_UPDATED_AT = "Oct 10 2019";

$(document).ready(function () {
    let nav = new Navbar();
    nav.init();
    const versions = {
        1: {
            name: "Star Trek",
            info: "",
            features: [],
            authors: ["David Matuszek", "Paul Reynolds", "Don Smith"],
            createdDate: ""
        },
        2: {
            name: "Super Star Trek",
            info: "",
            features: [],
            authors: ["Tom Almy"], // ??
            createdDate: ""
        },
        3: {
            name: "Super Star Trek+",
            info: "",
            features: [],
            author: "Eric Glover"
        }
    };

    terminal.$terminal = $("#terminal").Ptty({
        ps: DEBUG ? "COMMAND>" : "",
        autocomplete: true,
        i18n: {
            welcome: "-SUPER- STAR TREK\n\n",
            error_not_found: "Command not recognized, try 'help'.",
            error_bad_methdo: "Command malformed. Try 'help'."
        }
    });
    // test some things
    if (RUN_TESTS) {
        let tester = new Tests();
        tester.testAngle();
    }

    // make our game and menu
    let game = new Game(terminal);
    let menu = new Menu(terminal);
    menu.game = game;
    terminal.silent = false;

    if (DEBUG) { // SKIP the menu
        game.start();
        window.game = game;
        window.terminal = terminal;
    } else {
        menu.start();
    }
});
