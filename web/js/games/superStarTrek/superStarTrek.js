import "../../../lib/ptty.jquery.js";
import Game from "./Game.js";
import Menu from "./Menu.js";
import {terminal} from './Terminal.js';
export const DEBUG = false;

$(document).ready(function() {
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

  // make our game and menu
  let game = new Game(terminal);
  let menu = new Menu(terminal, () => game.start());
  window.game = game;
  window.terminal = terminal;

  if(DEBUG) { // SKIP the menu
    game.start();
  } else {
    menu.start();
  }



});
