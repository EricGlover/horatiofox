import "../../../lib/ptty.jquery.js";
import Game from "./Game.js";
import Menu from "./Menu.js";
import {terminal} from './Terminal.js';
export const DEBUG = false;

function calcAngle(from, to) {
  let deltaX = to[0] - from[0];
  let deltaY = -1 * (to[1] - from[1]);
  return Math.atan2(deltaY, deltaX);
}
function convertToDegrees(rad) {
  return rad * 180 / Math.PI;
}
function testAngle() {
  let me = [0,0];
  let topLeft = [-1,-1];
  let top = [0,-1];
  let topRight = [1,-1];
  let right = [1,0];
  let bottomRight = [1,1];
  let bottom = [0,1];
  let bottomLeft = [-1,1];
  let left = [-1,0];

  let points  = [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left];
  points.forEach(point => {
    let angle = calcAngle(me, point);
    console.log(angle);
    console.log(convertToDegrees(angle));
    debugger;
  })
}
// testAngle();

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
