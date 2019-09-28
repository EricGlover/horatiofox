var path = require("path");

module.exports = {
  mode: "development",
  context: path.resolve(__dirname),
  entry: {
    main: "./web/js/pages/index.js",
    profile: "./web/js/pages/profile.js",
    superStarTrek: "./web/js/games/superStarTrek.js"
  },
  output: {
    path: path.resolve(__dirname, "web/dist"),
    filename: "[name].bundle.js"
  }
};
