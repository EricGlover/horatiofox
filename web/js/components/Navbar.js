"use strict";

import GlobalErrorHandler from "./Errors.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

function Navbar() {
  function parseForm($form) {
    let data = {};
    $form.serializeArray().forEach(field => {
      data[field.name] = field.value;
    });
    return data;
  }

  function redirectToOrigin() {
    window.location.href = window.location.origin;
  }

  function handleOpenSignUp(e) {
    let $template = $("#sign-up");
    // $("body").append($template);
    $template.find("input").each(function(i, el) {
      $(el).val("");
    });
    $template.modal("show");
    $template
      .find("#submit")
      .off("click")
      .on("click", handleSignUp);
  }

  function handleOpenLogin(e) {
    let $template = $("#login");
    $template.find("input").each(function(i, el) {
      $(el).val("");
    });
    $template.modal("show");
    $template
      .find("#login-btn")
      .off("click")
      .on("click", handleLogin);
  }

  // TODO:: SETUP SOME TEMPLATING
  function handleSignUp(e) {
    let $modal = $("#sign-up");
    let $form = $modal.find("form");
    let data = parseForm($form);

    let $button = $("#submit-btn");
    $button.addClass("loading");

    $form.find(".error.message").transition("hide");

    fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw res;
        // redirect back to /
        redirectToOrigin();
      })
      .catch(async function(e) {
        console.error(e);
        //display error
        $form.find(".error.message").transition("show");
      })
      .then(() => $button.removeClass("loading"));
  }

  function handleLogin(e) {
    let $modal = $("#login");
    let $form = $modal.find("form");
    let data = parseForm($form);

    let $button = $("#login-btn");
    $button.addClass("loading");

    $form.find(".error.message").transition("hide");

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw res;
        // redirect back to /
        redirectToOrigin();
      })
      .catch(e => {
        console.error(e);
        $form.find(".error.message").transition("show");
      })
      .then(() => $button.removeClass("loading"));
  }

  function handleLogout(e) {
    let $btn = $("#logout-btn");
    $btn.addClass("loading");
    fetch("/logout", {
      method: "POST"
    })
      .then(res => {
        console.log(res);
        return res;
      })
      .then(res => {
        if (!res.ok) throw res;
        redirectToOrigin();
      })
      .catch(e => {
        console.error(e);
      })
      .then(() => $btn.removeClass("loading"));
  }

  function handleConfirmInput(e) {
    e.stopPropagation();
    let confirmVal = this.value;
    let password = $("#sign-up input[name='password']").val();
    if (confirmVal !== password) {
      $(this)
        .closest(".field")
        .addClass("error");
    } else {
      $(this)
        .closest(".field")
        .removeClass("error");
    }
    renderSignupValid(isSignupValid());
  }

  // change an input to concealed or show
  function handleToggleShowInput(e) {
    $(this).toggleClass("slash");
    let $input = $(this).siblings("input");
    if ($input.attr("type") === "password") {
      $input.attr("type", "text");
    } else {
      $input.attr("type", "password");
    }
  }

  function isSignupValid() {
    // matching passwords
    let password = $("#sign-up input[name='password']").val();
    let confirmVal = $("#sign-up input[name='confirm-password']").val();
    if (password !== confirmVal) {
      return false;
    }
    return true;
  }

  function renderSignupValid(isValid) {
    let $signupForm = $("#sign-up");
    if (isValid) {
      $signupForm.find("#submit").removeClass("disabled");
    } else {
      $signupForm.find("#submit").addClass("disabled");
    }
  }

  function register() {
    let $signUpModal = $("#sign-up");
    $("#sign-up-btn").on("click", handleOpenSignUp);
    $("#login-btn").on("click", handleOpenLogin);
    $("#logout-btn").on("click", handleLogout);

    // sign up modal key handler
    $signUpModal
      .find("input[name='confirm-password']")
      .on("input", handleConfirmInput);

    $(".eye.slash").on("click", handleToggleShowInput);

    // set close handler for messages
    $(".message .close")
      .off()
      .on("click", function(e) {
        e.stopPropagation();
        $(this)
          .closest(".message")
          .transition("fade");
      });
  }

  function init() {
    register();
  }

  return {
    init
  };
}

export default Navbar;
