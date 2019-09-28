import "../../lib/ptty.jquery.js";

$(document).ready(function() {
  // fuck nuts
  // todo:: setup
  console.log("fuck");
  let $ptty = $("#terminal").Ptty({
    ps: "",
    autocomplete: true,
    i18n: {
      welcome: "-SUPER- STAR TREK\n\n",
      error_not_found: "Command not recognized, try 'help'.",
      error_bad_methdo: "Command malformed. Try 'help'."
    }
  });

  // todo:: setup commands

  // todo:: print welcome screen
  $ptty.echo("SUPER STAR TREK");
  $ptty.echo("-SUPER- STAR TREK");
  $ptty.echo("\n\n");
});

// set up terminal
// import { Terminal } from "xterm";
// var term = new Terminal({ cursorBlink: true });
// let $term = $("#terminal");
// // $term.on("keypress", e => {
// //   debugger;
// // });
// term.open($term.eq(0)[0]);
// term.write("SUPER STAR TREK\n");
// term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
// term.on("key", (key, ev) => {
//   console.log(key.charCodeAt(0));
//   if (key.charCodeAt(0) == 13) term.write("\n");
//   term.write(key);
// });
// term.textarea.onkeypress = function(e) {
//
//   term.write(String.fromCharCode(e.keyCode));
// };
// let myBuffer = [];
//
// // This is an xterm.js instance
// term.on('key', function(key, e) {
//   myBuffer.push(key);
// });
//
// term.on('lineFeed', function() {
//   let keysEntered = myBuffer.join('');  // Or something like that
//   myBuffer = [];  // Empty buffer
// });
