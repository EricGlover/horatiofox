import "../../../lib/ptty.jquery.js";
import Game from "./Game.js";
import Menu from "./Menu.js";
import {terminal} from './Terminal.js';

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
    ps: "COMMAND>",
    autocomplete: true,
    i18n: {
      welcome: "-SUPER- STAR TREK\n\n",
      error_not_found: "Command not recognized, try 'help'.",
      error_bad_methdo: "Command malformed. Try 'help'."
    }
  });

  let game = new Game(terminal);
  game.start();
  window.game = game;

  // run menu
  // let menu = new Menu($ptty, () => game.start());
  // menu.start();
});
