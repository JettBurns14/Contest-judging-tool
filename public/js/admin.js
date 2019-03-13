let navButtons = document.getElementsByClassName("nav-button");
let pages = document.getElementsByClassName("page-content");
let updateButton = document.getElementById("update-entries-button");

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

let showCreateContestForm = (evaluator_name) => {
    // evaluator_name is passed into this displayed HTML.
    let createContest = document.querySelector("#create-contest-container");
    let viewContests = document.querySelector("#view-contests-container");
    // let createContestForm = document.querySelector("#create-contest-form");
    viewContests.style.display = "none";
    createContest.style.display = "block";
    // createContestForm[0].value = evaluator_name;
}
let showEditContestForm = (...args) => {
    let editContest = document.querySelector("#edit-contest-container");
    let viewContests = document.querySelector("#view-contests-container");
    let editContestForm = document.querySelector("#edit-contest-form");
    viewContests.style.display = "none";
    editContest.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editContestForm.length - 1; i++) {
        console.log(args[i]);
        editContestForm[i].value = args[i];
    }
};
let deleteContest = (id) => {
    let confirm = window.confirm("Are you sure you want to delete this contest?");

    if (confirm) {
        post("/api/deleteContest", {
            'contest_id': id
        });
    }
};

let showCreateUserForm = (evaluator_name) => {
    // evaluator_name is passed into this displayed HTML.
    let createUser = document.querySelector("#create-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    // let createContestForm = document.querySelector("#create-contest-form");
    viewUsers.style.display = "none";
    createUser.style.display = "block";
}
let showEditUserForm = (...args) => {
    // id, name, kaid, is_admin, account_locked
    let editUser = document.querySelector("#edit-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-form");
    let userOptions = document.querySelectorAll(".user_option");
    viewUsers.style.display = "none";
    editUser.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 3; i++) {
        console.log(args[i]);
        editUserForm[i].value = args[i];
    }

    if (args[3]) {
        userOptions[0].setAttribute("selected", true);
    } else {
        userOptions[1].setAttribute("selected", true);
    }

    if (args[4]) {
        userOptions[2].setAttribute("selected", true);
    } else {
        userOptions[3].setAttribute("selected", true);
    }
};
let deleteWhitelistedUser = (kaid) => {
    var approval = window.confirm("Are you sure you want to remove this user from the whitelist?");

    if (approval) {
        post('/api/removeWhitelistedUser', {
            kaid: kaid
        });
    }
}


// Send post requests without visible form element
let post = (path, params, method) => {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    let form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            let hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}