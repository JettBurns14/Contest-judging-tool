let navButtons = document.getElementsByClassName("nav-button");
let pages = document.getElementsByClassName("content-container");

let showpage = (page) => {
    for (let i = 0; i < pages.length; ++i) {
        pages[i].style.display = "none";
    }
    for (let i = 0; i < navButtons.length; ++i) {
        navButtons[i].classList.remove("selected");
    }
    navButtons[page].classList.add("selected");
    pages[page].style.display = "block";

    if (page == 0) {
        pages[page].style.display = "flex";
    }
};
showpage(0);

///// These send form post requests /////
let addContest = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "contest_current") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/addContest", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let editContest = (e) => {
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
    request("post", "/api/editContest", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteContest = (contest_id) => {
    let confirm = window.confirm("Are you sure you want to delete this contest?");
    if (confirm) {
        request("post", "/api/deleteContest", {
            contest_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
};

let whitelistUser = (e) => {
    e.preventDefault();
    let kaid = e.target[0].value;
    request("post", "/api/whitelistUser", {
        kaid
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteWhitelistedUser = (kaid) => {
    let confirm = window.confirm("Are you sure you want to remove this user from the whitelist?");
    if (confirm) {
        request("post", "/api/removeWhitelistedUser", {
            kaid
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

let editUser = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "edit_user_is_admin" || key.name === "edit_user_account_locked") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/editUser", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let addTask = (e) => {
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
    request("post", "/api/addTask", body, (data) => {
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
    request("post", "/api/editTask", body, (data) => {
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
        request("post", "/api/deleteTask", {
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

///// HTML modifier functions (like displaying forms) /////
let showCreateContestForm = () => {
    let createContest = document.querySelector("#create-contest-container");
    let viewContests = document.querySelector("#view-contests-container");
    viewContests.style.display = "none";
    createContest.style.display = "block";
}
let showEditContestForm = (...args) => {
    let editContest = document.querySelector("#edit-contest-container");
    let viewContests = document.querySelector("#view-contests-container");
    let editContestForm = document.querySelector("#edit-contest-form");
    viewContests.style.display = "none";
    editContest.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editContestForm.length - 1; i++) {
        if (editContestForm[i].name === "edit_contest_current") {
            editContestForm[i].checked = args[i];
        } else {
            editContestForm[i].value = args[i];
        }
    }
};

let showCreateUserForm = () => {
    let createUser = document.querySelector("#create-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    viewUsers.style.display = "none";
    createUser.style.display = "block";
}

let showEditUserForm = (...args) => {
    // id, name, kaid, is_admin, account_locked
    let editUser = document.querySelector("#edit-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-form");
    viewUsers.style.display = "none";
    editUser.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 1; i++) {
        if (editUserForm[i].name === "edit_user_is_admin" || editUserForm[i].name === "edit_user_account_locked") {
            editUserForm[i].checked = args[i];
        } else {
            editUserForm[i].value = args[i];
        }
    }
};

let showCreateTaskForm = () => {
    let createTask = document.querySelector("#create-task-container");
    let viewTasks = document.querySelector("#view-tasks-container");
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
