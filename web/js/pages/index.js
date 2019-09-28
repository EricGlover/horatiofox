"use strict";
import GlobalErrorHandler from "../components/Errors.js";
import Navbar from "../components/Navbar.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

$(document).ready(function() {
  let nav = new Navbar();
  nav.init();
});
