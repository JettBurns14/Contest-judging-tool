let header = document.querySelector(".page-header");
header.classList.add("hero");

///// These send form post requests /////
let addMessage = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.name === "edit_contest_current") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/addMessage", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let editMessage = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.name === "edit_contest_current") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/editMessage", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let deleteMessage = (message_id) => {
    let confirm = window.confirm("Are you sure you want to delete this message?");

    if (confirm) {
        request("post", "/api/deleteMessage", {
            message_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

let editTask = (edit_task_id, edit_task_title, edit_due_date, edit_assigned_member, edit_task_status) => {
    let confirm = window.confirm("Are you sure you want to mark this task as " + edit_task_status + "?");
    if (confirm) {
        request("post", "/api/editTask", {
            edit_task_id, edit_task_title, edit_due_date, edit_assigned_member, edit_task_status
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

///// HTML modifier functions (like displaying forms) /////
let showCreateMessageForm = () => {
    let createMsg = document.querySelector("#create-message-container");
    let viewMsgs = document.querySelector("#view-messages-container");
    viewMsgs.style.display = "none";
    createMsg.style.display = "block";
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
        editMsgForm[i].value = args[i];
    }
}
