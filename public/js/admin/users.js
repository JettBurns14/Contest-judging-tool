let usersSpinner = document.querySelector("#users-spinner");
let usersPreviewBox = document.querySelector("#users-preview-box");
let kaidsSpinner = document.querySelector("#kaids-spinner");
let whitelistedKaidsTable = document.querySelector("#whitelisted-kaids");
let tab = document.querySelector("#sidebar-users");

// Loads page data
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

// Form request handlers
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

// Displays forms
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
    
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 1; i++) {
        if (editUserForm[i].name === "edit_user_is_admin" || editUserForm[i].name === "edit_user_account_locked" || editUserForm[i].name === "edit_user_receive_emails") {
            editUserForm[i].checked = args[i];
        } else {
            editUserForm[i].value = args[i];
        }
    }
};

// Update navbar highlighting
tab.classList.add("selected");
