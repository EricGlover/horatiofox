"use strict";

import GlobalErrorHandler from "../components/Errors.js";
import Navbar from "../components/Navbar.js";

const errorHandler = new GlobalErrorHandler("error");
errorHandler.init();

let $oldForm;
let $successMessage;
let $errorMessage;

function parseForm($form) {
  let data = {};
  $form.serializeArray().forEach(field => {
    data[field.name] = field.value;
  });
  return data;
}

function handleCancel(e) {
  e.stopPropagation();
  e.preventDefault();
  //reset the form
  $("form#edit-profile").remove();
  let $tmp = $oldForm;
  $oldForm = $tmp.clone();
  $("#form-container").prepend($tmp);
  register();
}

function handleSubmitChanges(e) {
  let $form = $("form#edit-profile");
  let data = parseForm($form);
  let $button = $("#save");
  $button.addClass("loading");

  $successMessage.transition("hide");
  $errorMessage.transition("hide");

  fetch("/editProfile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (!res.ok) throw res;
      $successMessage.transition("show");
      return res;
    })
    .catch(e => {
      $errorMessage.transition("show");
      //TODO:: HANDLE ERROR
    })
    .then(() => $button.removeClass("loading"));
}

function register() {
  $("#cancel")
    .off()
    .on("click", handleCancel);
  $("#save")
    .off()
    .on("click", handleSubmitChanges);

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

$(document).ready(function() {
  let nav = new Navbar();
  nav.init();
  // save an old copy
  $oldForm = $("form#edit-profile")
    .clone()
    .detach();
  register();
  $successMessage = $("#success-message");
  $errorMessage = $("#error-message");
});
