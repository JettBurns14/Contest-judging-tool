let showCreateMessageForm = (evaluator_name) => {
    // evaluator_name is passed into this displayed HTML.
    let createMsg = document.querySelector("#create-message-container");
    let viewMsgs = document.querySelector("#view-messages-container");
    let createMsgForm = document.querySelector("#create-message-form");
    viewMsgs.style.display = "none";
    createMsg.style.display = "block";
    createMsgForm[0].value = evaluator_name;
}

let showEditMessageForm = (...args) => {
    // Params are passed into displayed HTML.
    let editMsg = document.querySelector("#edit-message-container");
    let viewMsgs = document.querySelector("#view-messages-container");
    let editMsgForm = document.querySelector("#edit-message-form");
    viewMsgs.style.display = "none";
    editMsg.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editMsgForm.length - 1; i++) {
        console.log(args[i]);
        editMsgForm[i].value = args[i];
    }
}

let deleteMessage = (id) => {
    let confirm = window.confirm("Are you sure you want to delete this message?");

    if (confirm) {
        post("/api/deleteMessage", {
            'message_id': id
        });
    }
}

// Send post requests without visible form element
let post = (path, params, method) => {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
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