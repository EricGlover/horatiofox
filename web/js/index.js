"use strict";

import GlobalErrorHandler from "./Errors.js";
import Navbar from "./navbar.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

$(document).ready(function() {
  let nav = new Navbar();
  nav.init();
});
