let contestPreviewBox = document.querySelector("#contest-preview-box");
let contestsSpinner = document.querySelector("#contests-spinner");
let tab = document.querySelector("#sidebar-contests");

// Loads page data
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

// Handles form requests
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

// Displays forms
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

// Update navbar highlighting
tab.classList.add("selected");
