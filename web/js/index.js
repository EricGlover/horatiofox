"use strict";

import GlobalErrorHandler from "./Errors.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

console.log("running index.js");