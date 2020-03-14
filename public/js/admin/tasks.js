let tasksTableBody = document.querySelector("#tasks-table-body");
let taskAssignedMember = document.querySelector("#assigned_member");
let editTaskAssignedMember = document.querySelector("#edit_assigned_member");
let tab = document.querySelector("#sidebar-tasks");

// Load page data
request("get", "/api/internal/tasks", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.tasks.forEach(t => {
                tasksTableBody.innerHTML += `
                <tr id="${t.task_id}">
                    <td>${t.task_title}</td>
                    <td>${t.due_date}</td>
                    <td>${t.evaluator_name}</td>
                    <td>${t.task_status}</td>
                    ${data.is_admin ? `
                        <td id="${t.task_id}-actions">
                            <i class="control-btn far fa-edit" onclick="showEditTaskForm(${t.task_id}, '${t.task_title}', '${t.due_date}', '${t.assigned_member}', '${t.task_status}');"></i>
                            <i class="control-btn red far fa-trash-alt" onclick="deleteTask(${t.task_id});"></i>
                        </td>
                    ` : ""}
                </tr>`;
            });
        }
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/users", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.evaluators.forEach(c => {
                taskAssignedMember.innerHTML += `
                    ${!c.account_locked ? `
                        <option value="${c.evaluator_id}">${c.evaluator_name}</option>
                    ` : ""}
                `;
                editTaskAssignedMember.innerHTML += `
                    ${!c.account_locked ? `
                        <option value="${c.evaluator_id}">${c.evaluator_name}</option>
                    ` : ""}
                `;
            });
        }
    } else {
        alert(data.error.message);
    }
});

// Handles form requests
let addTask = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/tasks", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let editTask = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("put", "/api/internal/tasks", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteTask = (task_id) => {
    let confirm = window.confirm("Are you sure you want to delete this task?");
    if (confirm) {
        request("delete", "/api/internal/tasks", {
            task_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

// Shows task forms
let showCreateTaskForm = () => {
    let createTask = document.querySelector("#create-task-container");
    let viewTasks = document.querySelector("#view-tasks-container");

    // Set default date
    let today = new Date();
    let date = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
    document.querySelector("#add-task-form #due_date").value = date;

    viewTasks.style.display = "none";
    createTask.style.display = "block";
}
let showEditTaskForm = (...args) => {
    let editTask = document.querySelector("#edit-task-container");
    let viewTasks = document.querySelector("#view-tasks-container");
    let editTaskForm = document.querySelector("#edit-task-form");
    viewTasks.style.display = "none";
    editTask.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editTaskForm.length - 1; i++) {
        editTaskForm[i].value = args[i];
    }
}

// Update navbar highlighting
tab.classList.add("selected");
