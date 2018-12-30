"use strict";

import GlobalErrorHandler from "./Errors.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

function parseForm($form) {
  let data = {};
  $form.serializeArray().forEach(field => {
    data[field.name] = field.value;
  });
  return data;
}

// TODO:: SETUP SOME TEMPLATING
function handleSignUp(e) {
  let $modal = $("#sign-up");
  let $form = $modal.find("form");
  let data = parseForm($form);
  fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      console.log(res);
      return res;
    })
    .then(res => {
      if (!res.ok) throw res;
      location.reload(true);
      return res;
    })
    .then(res => {
      $modal.modal("hide");
      return res;
    })
    .then(data => console.log("success?", data))
    .catch(e => console.error(e));
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

function handleLogin(e) {
  let $modal = $("#login");
  let $form = $modal.find("form");
  let data = parseForm($form);
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      console.log(res);
      return res;
    })
    .then(res => {
      if (!res.ok) throw res;
      location.reload(true);
      return res;
    })
    .then(res => {
      $modal.modal("hide");
      return res;
    })
    .then(data => console.log("success?", data))
    .catch(e => console.error(e));
}

function handleLogout(e) {
  fetch("/logout", {
    method: "POST"
  })
    .then(res => {
      console.log(res);
      return res;
    })
    .then(res => {
      if (!res.ok) throw res;
      return res;
    })
    .then(res => {
      location.reload(true);
      return res;
    })
    .then(data => console.log("success?", data))
    .catch(e => console.error(e));
}

function register() {
  $("#sign-up-btn").on("click", handleOpenSignUp);
  $("#login-btn").on("click", handleOpenLogin);
  $("#logout-btn").on("click", handleLogout);
}

$(document).ready(function() {
  console.log("doc ready");
  register();
});
