let header = document.querySelector(".page-header");
header.classList.add("hero");
let messagesContainer = document.querySelector("#messages-container");
let messagesSpinner = document.querySelector("#messages-spinner");
let tasksContainer = document.querySelector("#tasks-container");

// Get messages, and load into page.
request("get", "/api/internal/messages", null, (data) => {
    if (!data.error) {
        messagesSpinner.style.display = "none";
        if (data.messages.length === 0) {
            messagesContainer.innerHTML = "No public messages"
        }
        // Display private stuff based on returned logged_in or is_admin prop.
        data.messages.forEach((msg, idx) => {
            messagesContainer.innerHTML +=
            `<div class="message-container">
                <div class="message-header">
                    <h3>
                        ${ msg.message_title }
                    </h3>
                </div>
                <div class="message-content">
                    ${ msg.message_content.replace(/\n/g, '<br>') }
                </div>
                <div class="message-bottom">
                    <div class="message-options">
                        ${ data.is_admin
                            ? `<i class="control-btn far fa-edit" onclick="showEditMessageForm(${ msg.message_id }, '${ msg.message_date }', '${ msg.message_title }', \`${ msg.message_content.replace(/"/g, "'") }\`, ${ msg.public });"></i>
                                <i class="control-btn red far fa-trash-alt" onclick="deleteMessage(${ msg.message_id })"></i>`
                            : ""
                        }
                    </div>
                    <div class="message-meta">
                        ${ data.logged_in
                            ? `<p class="message-public ${msg.public ? "red" : "green"}">${ msg.public ? "Public" : "Not public" }</p>`
                            : ""
                        }
                        <p class="message-author">By
                            ${ msg.message_author }
                        </p>
                        <p class="message-date">Posted
                            ${ msg.message_date }
                        </p>
                    </div>
                </div>
            </div>`;
        });
    } else {
        alert(data.error.message);
    }
});
// Get tasks for user, load into its container.
request("get", "/api/internal/tasks/user", null, data => {
    if (!data.error) {
        if (data.tasks) {
            if (data.tasks.length === 0) {
                return tasksContainer.innerHTML = "<p>Woohoo! There are no tasks currently assigned to you!</p>";
            }
            data.tasks.forEach(c => {
                tasksContainer.innerHTML += `
                    <div class="task">
                        <h3>${c.task_title}</h3>
                        <p><strong>Due by: </strong>${c.due_date}</p>
                        
                            ${c.task_status === "Not Started" ? `
                                <span class="task-action" onclick="editTask(${c.task_id}, '${c.task_title}', '${c.due_date}', ${c.assigned_member}, 'Started');"><i class="control-btn far fa-edit"></i>Mark as Started</span>
                            ` : c.task_status === "Started" ? `
                                <span class="task-action" onclick="editTask(${c.task_id}, '${c.task_title}', '${c.due_date}', ${c.assigned_member}, 'Completed');">Mark as Completed</span>
                            ` : ""}
                        </p>
                    </div>
                `;
            });
        }
    } else {
        alert(data.error.message);
    }
});

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
        if (editMsgForm[i].name === "public") {
            editMsgForm[i].checked = args[i];
        } else {
            editMsgForm[i].value = args[i];
        }
    }
}

let editTask = (edit_task_id, edit_task_title, edit_due_date, edit_assigned_member, edit_task_status) => {
    let confirm = window.confirm("Are you sure you want to mark this task as " + edit_task_status + "?");
    if (confirm) {
        request("put", "/api/internal/tasks", {
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

///// These send form post requests /////
let addMessage = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "public") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/internal/messages", body, (data) => {
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
        if (key.name === "public") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("put", "/api/internal/messages", body, (data) => {
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
        request("delete", "/api/internal/messages", {
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