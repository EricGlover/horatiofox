import "../../../lib/ptty.jquery.js";
import Game from "./Game.js";
import Menu from "./Menu.js";

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

  // todo:: setup
  let $ptty = $("#terminal").Ptty({
    ps: "",
    autocomplete: true,
    i18n: {
      welcome: "-SUPER- STAR TREK\n\n",
      error_not_found: "Command not recognized, try 'help'.",
      error_bad_methdo: "Command malformed. Try 'help'."
    }
  });
  window.$ptty = $ptty;

  $ptty.register("command", {
    name: "type",
    method: function(cmd) {
      var txt = $ptty.get_command_option("last").split(" ");
      txt.shift();
      var to_type = txt.join(" ");
      if (to_type == "") {
        to_type = "<h1>  ლ(ಠ益ಠლ)<br>Y U NO INPUT ?</h1>";
      }

      cmd.data = { type: to_type };

      return cmd;
    },
    help: "Typewriter effect. Usage: type [text to type out]"
  });

  $ptty.register("callback", {
    name: "type",
    method: function(cmd) {
      var text_input = $ptty.get_terminal(".prompt");
      debugger;
      if (cmd.data && cmd.data.type && typeof cmd.data.type === "string") {
        text_input.hide();
        // Decode special entities.
        var str = $("<div>")
          .html(cmd.data.type + " ")
          .html();

        // Append
        if (!$(".content div .cmd_out:last").length) {
          $('<div><div class="cmd_out"></div></div>').appendTo(".content");
        }
        var typebox = $("<span></span>").appendTo(".content .cmd_out:last");

        // Type string out
        var i = 0,
          isTag,
          text;
        (function typewriter() {
          text = str.slice(0, ++i);
          if (text === str) {
            text_input.show();
            $ptty.echo();
            return;
          }

          typebox.html(text);
          $ptty.echo(); // force scroll to bottom

          var char = text.slice(-1);
          if (char === "<") isTag = true;
          if (char === ">") isTag = false;

          if (isTag) return typewriter();
          setTimeout(typewriter, 60);
        })();
      }
    }
  });

  // let game = new Game($ptty);
  // let menu = new Menu($ptty, () => game.start());
  // menu.start();
});
