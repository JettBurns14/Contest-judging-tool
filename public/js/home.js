function deleteMessage(id) {
  let confirm = window.confirm("Are you sure you want to delete this message?");

  if (confirm) {
    post("/api/deleteMessage", {'message_id': id});
  }
}

function createMessage(evaluator_name) {
  let heading = "<div id='messages-heading'><h2>New Announcement:</h2></div>";
  let form = "<div id='create-announcement-page'><div class='form-container'><form id='create-announcement-form' method='post' action='/api/addMessage' target='_self'><div class='row'><div class='col-75'><input type='hidden' id='message_author' name='message_author' value='" + evaluator_name + "'></div></div><div class='row'><div class='col-25'><label for='message_date'>Date</label></div><div class='col-75'><input type='text' id='message_date' name='message_date' placeholder='YYYY-MM-DD'></div></div><div class='row'><div class='col-25'><label for='message_title'>Announcement Title</label></div><div class='col-75'><input type='text' id='message_title' name='message_title'></div></div><div class='row'><div class='col-25'><label for='message_content'>Message</label></div><div class='col-75'><textarea id='message_content' name='message_content' maxlength='5000'></textarea></div></div><div class='row'><input type='submit' value='Save'></div></form></div></div>";

  let messageSection = document.getElementById('message-section');
  messageSection.innerHTML = heading + form;
}

function editMessage(message_id, message_author, message_title, message_content) {
  let heading = "<div id='messages-heading'><h2>Edit Announcement:</h2></div>";
  let form = "<div id='create-announcement-page'><div class='form-container'><form id='create-announcement-form' method='post' action='/api/editMessage' target='_self'><div class='row'><div class='col-75'><input type='hidden' id='message_id' name='message_id' value='" + message_id + "'></div></div><div class='row'><div class='col-75'><input type='hidden' id='message_author' name='message_author' value='" + message_author + "'></div></div><div class='row'><div class='col-25'><label for='message_date'>Date</label></div><div class='col-75'><input type='text' id='message_date' name='message_date' placeholder='YYYY-MM-DD' required></div></div><div class='row'><div class='col-25'><label for='message_title'>Announcement Title</label></div><div class='col-75'><input type='text' id='message_title' name='message_title' value='" + message_title + "'></div></div><div class='row'><div class='col-25'><label for='message_content'>Message</label></div><div class='col-75'><textarea id='message_content' name='message_content' maxlength='5000'>" + message_content + "</textarea></div></div><div class='row'><input type='submit' value='Save'></div></form></div></div>";

  let messageSection = document.getElementById('message-section');
  messageSection.innerHTML = heading + form;
}

// Send post requests without visible form element
function post(path, params, method) {
  method = method || "post"; // Set method to post by default if not specified.

  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
      if(params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
      }
  }

  document.body.appendChild(form);
  form.submit();
}
