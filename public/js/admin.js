let navButtons = document.getElementsByClassName("nav-button");
let pages = document.getElementsByClassName("content-container");
let reviewedEntriesCount = document.querySelector("#reviewed-entries-count");
let totalEvaluationsCount = document.querySelector("#total-evaluations-count");
let contestPreviewBox = document.querySelector("#contest-preview-box");
let contestsSpinner = document.querySelector("#contests-spinner");
let usersSpinner = document.querySelector("#users-spinner");
let usersPreviewBox = document.querySelector("#users-preview-box");
let kaidsSpinner = document.querySelector("#kaids-spinner");
let whitelistedKaidsTable = document.querySelector("#whitelisted-kaids");
let tasksTableBody = document.querySelector("#tasks-table-body");
// The "select" tags to display evaluators inside
let taskAssignedMember = document.querySelector("#assigned_member");
let editTaskAssignedMember = document.querySelector("#edit_assigned_member");

// Get stats for admin dashboard, and load into page.
request("get", "/api/internal/admin/stats", null, (data) => {
    if (!data.error) {
        reviewedEntriesCount.textContent = `${data.reviewedEntriesCount} / ${data.entryCount}`;
        totalEvaluationsCount.textContent = `${data.totalEvaluationsCount} / ${data.totalEvaluationsNeeded}`;
    } else {
        alert(data.error.message);
    }
});
// Get all contests, and load into Contests tab page.
request("get", "/api/internal/contests", null, (data) => {
    if (!data.error) {
        contestsSpinner.style.display = "none";
        data.contests.forEach((c, idx) => {
            contestPreviewBox.innerHTML += `
            <div class="preview col-4 standard ${c.current ? "current-contest" : ""}">
                <div class="db-header">
                    <p>
                        ${c.contest_name} - #${c.contest_id}
                    </p>
                    ${data.is_admin
                        ? `<div class="contest-options">
                                <i class="control-btn far fa-edit" onclick="showEditContestForm(${c.contest_id}, '${c.contest_name}', '${c.contest_url}', '${c.contest_author}', '${c.date_start}', '${c.date_end}', ${c.current});"></i>
                                <i class="control-btn red far fa-trash-alt" onclick="deleteContest(${c.contest_id})"></i>
                            </div>`
                        : ""
                    }
                </div>
                <div class="preview-content">
                    <a href="${c.contest_url}" target="_blank">
                        <img class="preview-thumb" src="${c.contest_url}/latest.png">
                    </a>
                    <p>Start:
                        ${c.date_start}
                    </p>
                    <p>End:
                        ${c.date_end}
                    </p>
                </div>
            </div>
            `;
        });
    } else {
        alert(data.error.message);
    }
});
// Get user data, display in Users tab page, if logged in.
request("get", "/api/internal/users", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.evaluators.forEach(c => {
                usersSpinner.style.display = "none";
                usersPreviewBox.innerHTML += `
                    <div class="user preview col-4 standard">
                        <div class="db-header">
                            <p>
                                ${c.evaluator_name}
                            </p>
                            <div class="contest-options">
                                <i class="control-btn far fa-edit" onclick="showEditUserForm(${c.evaluator_id}, '${c.evaluator_name}', '${c.evaluator_kaid}', '${c.username}', '${c.nickname}', '${c.email}', '${c.dt_term_start}', '${c.dt_term_end}', ${c.is_admin}, ${c.account_locked}, ${c.receive_emails});"></i>
                            </div>
                        </div>
                        <div class="preview-content">
                            <a href="https://www.khanacademy.org/profile/${c.evaluator_kaid}" target="_blank">Profile</a>
                            <p>
                                <span class="bold">ID:</span>
                                ${c.evaluator_id}
                            </p>
                            <p>
                                <span class="bold">KAID:</span>
                                ${c.evaluator_kaid}
                            </p>
                            <p>
                                <span class="bold">Username:</span>
                                ${c.username}
                            </p>
                            <p>
                                <span class="bold">Nickname:</span>
                                ${c.nickname}
                            </p>
                            <p>
                                <span class="bold">Email:</span>
                                ${c.email}
                            </p>
                            <p>
                                <span class="bold">Receive emails:</span>
                                ${c.receive_emails}
                            </p>
                            <p>
                                <span class="bold">Term start:</span>
                                ${c.dt_term_start ?
                                    c.dt_term_start :
                                    `N/A`
                                }
                            </p>
                            <p>
                                <span class="bold">Term end:</span>
                                ${c.dt_term_end ?
                                    c.dt_term_end :
                                    `N/A`
                                }
                            </p>
                            <p>
                                <span class="bold">Logged in:</span>
                                ${c.logged_in}
                            </p>
                            <p>
                                <span class="bold">Last login:</span>
                                ${c.logged_in_tstz}
                            </p>
                            ${c.account_locked ? `
                            <p>
                                <span class="bold">Status:</span>
                                <span class="red">Deactivated</span>
                            </p>` : `
                            <p>
                                <span class="bold">Status:</span>
                                <span class="green">Active</span>
                            </p>`
                            }
                            <p>
                                <span class="bold">Permission Level:</span>
                                ${c.is_admin ? "Admin" : "Standard User"}
                            </p>
                        </div>
                    </div>
                `;
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
            kaidsSpinner.style.display = "none";
            data.kaids.forEach(c => {
                whitelistedKaidsTable.innerHTML += `
                <tr>
                    <td>
                        ${c.kaid}
                    </td>
                    <td>
                        <i class="control-btn red far fa-trash-alt" onclick="deleteWhitelistedUser('${c.kaid}')"></i>
                    </td>
                </tr>
                `;
            });
        }
    } else {
        alert(data.error.message);
    }
});
// Get all tasks, load into Tasks tab, if logged in.
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



///// These send form requests /////

// Contests
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
    request("post", "/api/internal/contests", body, (data) => {
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
    request("put", "/api/internal/contests", body, (data) => {
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
        request("delete", "/api/internal/contests", {
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



// Users
let whitelistUser = (e) => {
    e.preventDefault();
    let kaid = e.target[0].value;
    request("post", "/api/internal/users/whitelist", {
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
        request("delete", "/api/internal/users/whitelist", {
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
        if (key.name === "edit_user_is_admin" || key.name === "edit_user_account_locked" || key.name === "edit_user_receive_emails") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("put", "/api/internal/users", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}



// Tasks
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



///// HTML modifier functions (like displaying forms) /////

// Contests
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

// Users
let showCreateUserForm = () => {
    let createUser = document.querySelector("#create-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    viewUsers.style.display = "none";
    createUser.style.display = "block";
}
let showEditUserForm = (...args) => {
    // id, name, kaid, username, nickname, email, start, end, is_admin, account_locked, receive_emails
    let editUser = document.querySelector("#edit-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-form");
    viewUsers.style.display = "none";
    editUser.style.display = "block";
    console.log(args);
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 1; i++) {
        if (editUserForm[i].name === "edit_user_is_admin" || editUserForm[i].name === "edit_user_account_locked" || editUserForm[i].name === "edit_user_receive_emails") {
            editUserForm[i].checked = args[i];
        } else {
            editUserForm[i].value = args[i];
        }
    }
};



// Tasks
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
