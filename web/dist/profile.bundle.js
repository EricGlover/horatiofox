/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./web/js/pages/profile.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./web/js/components/Errors.js":
/*!*************************************!*\
  !*** ./web/js/components/Errors.js ***!
  \*************************************/
/*! exports provided: default, GlobalErrorHandler, FetchErrorHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GlobalErrorHandler\", function() { return GlobalErrorHandler; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FetchErrorHandler\", function() { return FetchErrorHandler; });\nfunction GlobalErrorHandler(logLevel) {\n  const validLogLevels = [\"error\", \"warn\", \"log\"];\n  const defaultLogLevel = \"warn\";\n\n  function setLogLevel() {\n    if (!validLogLevels.includes(logLevel)) {\n      console.error(\n        \"logLevel must be one of the following : \",\n        validLogLevels,\n        \". Setting logLevel to \",\n        defaultLogLevel\n      );\n      logLevel = defaultLogLevel;\n    }\n  }\n\n  function makeHumanReadableLog(e) {\n    switch (e) {\n      case e instanceof EvalError:\n        console.error(\"stop using eval you fuck\");\n        break;\n      case e instanceof InternalError:\n        console.error(\"looks like some JS code you made fucked up\");\n        break;\n      default:\n        console.error(\n          \"I couldn't even figure what error type that was so no snarky comment for you, sir!\"\n        );\n    }\n  }\n\n  function register() {\n    window.onerror = function(message, source, lineno, colno, error) {\n      switch (logLevel) {\n        case \"error\":\n          console.error(message, source, lineno, colno, error);\n          throw error;\n          break;\n        case \"log\":\n          console.log(message, source, lineno, colno, error);\n          break;\n        case \"warn\":\n        default:\n          console.error(message, source, lineno, colno, error);\n      }\n      makeHumanReadableLog(error);\n    };\n  }\n\n  function init() {\n    setLogLevel();\n    register();\n  }\n\n  return {\n    register,\n    init\n  };\n}\n\nfunction FetchErrorHandler() {\n  return {};\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (GlobalErrorHandler);\n\n/**\n * \n * \nError types\nSection\nBesides the generic Error constructor, there are seven other core error constructors in JavaScript. For client-side exceptions, see Exception handling statements.\n\nEvalError\n    Creates an instance representing an error that occurs regarding the global function eval().\nInternalError\n    Creates an instance representing an error that occurs when an internal error in the JavaScript engine is thrown. E.g. \"too much recursion\".\nRangeError\n    Creates an instance representing an error that occurs when a numeric variable or parameter is outside of its valid range.\nReferenceError\n    Creates an instance representing an error that occurs when de-referencing an invalid reference.\nSyntaxError\n    Creates an instance representing a syntax error that occurs while parsing code in eval().\nTypeError\n    Creates an instance representing an error that occurs when a variable or parameter is not of a valid type.\nURIError\n    Creates an instance representing an error that occurs when encodeURI() or decodeURI() are passed invalid parameters. \n */\n\n\n//# sourceURL=webpack:///./web/js/components/Errors.js?");

/***/ }),

/***/ "./web/js/components/Navbar.js":
/*!*************************************!*\
  !*** ./web/js/components/Navbar.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Errors.js */ \"./web/js/components/Errors.js\");\n\n\n\n\nconst errorHandler = new _Errors_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"error\");\nerrorHandler.init();\n\nfunction Navbar() {\n  function parseForm($form) {\n    let data = {};\n    $form.serializeArray().forEach(field => {\n      data[field.name] = field.value;\n    });\n    return data;\n  }\n\n  function redirectToOrigin() {\n    window.location.href = window.location.origin;\n  }\n\n  function handleOpenSignUp(e) {\n    let $template = $(\"#sign-up\");\n    // $(\"body\").append($template);\n    $template.find(\"input\").each(function(i, el) {\n      $(el).val(\"\");\n    });\n    $template.modal(\"show\");\n    $template\n      .find(\"#submit\")\n      .off(\"click\")\n      .on(\"click\", handleSignUp);\n  }\n\n  function handleOpenLogin(e) {\n    let $template = $(\"#login\");\n    $template.find(\"input\").each(function(i, el) {\n      $(el).val(\"\");\n    });\n    $template.modal(\"show\");\n    $template\n      .find(\"#login-btn\")\n      .off(\"click\")\n      .on(\"click\", handleLogin);\n  }\n\n  // TODO:: SETUP SOME TEMPLATING\n  function handleSignUp(e) {\n    let $modal = $(\"#sign-up\");\n    let $form = $modal.find(\"form\");\n    let data = parseForm($form);\n\n    let $button = $(\"#submit-btn\");\n    $button.addClass(\"loading\");\n\n    $form.find(\".error.message\").transition(\"hide\");\n\n    fetch(\"/users\", {\n      method: \"POST\",\n      headers: {\n        \"Content-Type\": \"application/json\"\n      },\n      body: JSON.stringify(data)\n    })\n      .then(res => {\n        if (!res.ok) throw res;\n        // redirect back to /\n        redirectToOrigin();\n      })\n      .catch(async function(e) {\n        console.error(e);\n        //display error\n        $form.find(\".error.message\").transition(\"show\");\n      })\n      .then(() => $button.removeClass(\"loading\"));\n  }\n\n  function handleLogin(e) {\n    let $modal = $(\"#login\");\n    let $form = $modal.find(\"form\");\n    let data = parseForm($form);\n\n    let $button = $(\"#login-btn\");\n    $button.addClass(\"loading\");\n\n    $form.find(\".error.message\").transition(\"hide\");\n\n    fetch(\"/login\", {\n      method: \"POST\",\n      headers: {\n        \"Content-Type\": \"application/json\"\n      },\n      body: JSON.stringify(data)\n    })\n      .then(res => {\n        if (!res.ok) throw res;\n        // redirect back to /\n        redirectToOrigin();\n      })\n      .catch(e => {\n        console.error(e);\n        $form.find(\".error.message\").transition(\"show\");\n      })\n      .then(() => $button.removeClass(\"loading\"));\n  }\n\n  function handleLogout(e) {\n    let $btn = $(\"#logout-btn\");\n    $btn.addClass(\"loading\");\n    fetch(\"/logout\", {\n      method: \"POST\"\n    })\n      .then(res => {\n        console.log(res);\n        return res;\n      })\n      .then(res => {\n        if (!res.ok) throw res;\n        redirectToOrigin();\n      })\n      .catch(e => {\n        console.error(e);\n      })\n      .then(() => $btn.removeClass(\"loading\"));\n  }\n\n  function handleConfirmInput(e) {\n    e.stopPropagation();\n    let confirmVal = this.value;\n    let password = $(\"#sign-up input[name='password']\").val();\n    if (confirmVal !== password) {\n      $(this)\n        .closest(\".field\")\n        .addClass(\"error\");\n    } else {\n      $(this)\n        .closest(\".field\")\n        .removeClass(\"error\");\n    }\n    renderSignupValid(isSignupValid());\n  }\n\n  // change an input to concealed or show\n  function handleToggleShowInput(e) {\n    $(this).toggleClass(\"slash\");\n    let $input = $(this).siblings(\"input\");\n    if ($input.attr(\"type\") === \"password\") {\n      $input.attr(\"type\", \"text\");\n    } else {\n      $input.attr(\"type\", \"password\");\n    }\n  }\n\n  function isSignupValid() {\n    // matching passwords\n    let password = $(\"#sign-up input[name='password']\").val();\n    let confirmVal = $(\"#sign-up input[name='confirm-password']\").val();\n    if (password !== confirmVal) {\n      return false;\n    }\n    return true;\n  }\n\n  function renderSignupValid(isValid) {\n    let $signupForm = $(\"#sign-up\");\n    if (isValid) {\n      $signupForm.find(\"#submit\").removeClass(\"disabled\");\n    } else {\n      $signupForm.find(\"#submit\").addClass(\"disabled\");\n    }\n  }\n\n  function register() {\n    let $signUpModal = $(\"#sign-up\");\n    $(\"#sign-up-btn\").on(\"click\", handleOpenSignUp);\n    $(\"#login-btn\").on(\"click\", handleOpenLogin);\n    $(\"#logout-btn\").on(\"click\", handleLogout);\n\n    // sign up modal key handler\n    $signUpModal\n      .find(\"input[name='confirm-password']\")\n      .on(\"input\", handleConfirmInput);\n\n    $(\".eye.slash\").on(\"click\", handleToggleShowInput);\n\n    // set close handler for messages\n    $(\".message .close\")\n      .off()\n      .on(\"click\", function(e) {\n        e.stopPropagation();\n        $(this)\n          .closest(\".message\")\n          .transition(\"fade\");\n      });\n  }\n\n  function init() {\n    register();\n  }\n\n  return {\n    init\n  };\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Navbar);\n\n\n//# sourceURL=webpack:///./web/js/components/Navbar.js?");

/***/ }),

/***/ "./web/js/pages/profile.js":
/*!*********************************!*\
  !*** ./web/js/pages/profile.js ***!
  \*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_Errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/Errors.js */ \"./web/js/components/Errors.js\");\n/* harmony import */ var _components_Navbar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Navbar.js */ \"./web/js/components/Navbar.js\");\n\n\n\n\n\nconst errorHandler = new _components_Errors_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"error\");\nerrorHandler.init();\n\nlet $oldForm;\nlet $successMessage;\nlet $errorMessage;\n\nfunction parseForm($form) {\n  let data = {};\n  $form.serializeArray().forEach(field => {\n    data[field.name] = field.value;\n  });\n  return data;\n}\n\nfunction handleCancel(e) {\n  e.stopPropagation();\n  e.preventDefault();\n  //reset the form\n  $(\"form#edit-profile\").remove();\n  let $tmp = $oldForm;\n  $oldForm = $tmp.clone();\n  $(\"#form-container\").prepend($tmp);\n  register();\n}\n\nfunction handleSubmitChanges(e) {\n  let $form = $(\"form#edit-profile\");\n  let data = parseForm($form);\n  let $button = $(\"#save\");\n  $button.addClass(\"loading\");\n\n  $successMessage.transition(\"hide\");\n  $errorMessage.transition(\"hide\");\n\n  fetch(\"/editProfile\", {\n    method: \"PUT\",\n    headers: {\n      \"Content-Type\": \"application/json\"\n    },\n    body: JSON.stringify(data)\n  })\n    .then(res => {\n      if (!res.ok) throw res;\n      $successMessage.transition(\"show\");\n      return res;\n    })\n    .catch(e => {\n      $errorMessage.transition(\"show\");\n      //TODO:: HANDLE ERROR\n    })\n    .then(() => $button.removeClass(\"loading\"));\n}\n\nfunction register() {\n  $(\"#cancel\")\n    .off()\n    .on(\"click\", handleCancel);\n  $(\"#save\")\n    .off()\n    .on(\"click\", handleSubmitChanges);\n\n  // set close handler for messages\n  $(\".message .close\")\n    .off()\n    .on(\"click\", function(e) {\n      e.stopPropagation();\n      $(this)\n        .closest(\".message\")\n        .transition(\"fade\");\n    });\n}\n\n$(document).ready(function() {\n  let nav = new _components_Navbar_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n  nav.init();\n  // save an old copy\n  $oldForm = $(\"form#edit-profile\")\n    .clone()\n    .detach();\n  register();\n  $successMessage = $(\"#success-message\");\n  $errorMessage = $(\"#error-message\");\n});\n\n\n//# sourceURL=webpack:///./web/js/pages/profile.js?");

/***/ })

/******/ });