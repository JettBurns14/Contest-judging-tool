let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);

let entriesTable = document.querySelector("#entries-table");
let entriesTableBody = document.querySelector("#entries-table-body");
let entriesSpinner = document.querySelector("#entries-spinner");
let entryContestName = document.querySelector("#entry-contest-name");
let sidebar = document.querySelector(".side-bar");
let sidebarSpinner = document.querySelector("#sidebar-spinner");
let groupDropdown = document.querySelector("#assigned-group-dropdown");
let currentGroupDropdown = document.querySelector("#current-group-dropdown");
let newGroupDropdown = document.querySelector("#new-group-dropdown");

request("get", "/api/internal/contests", null, (data) => {
    if (!data.error) {
        sidebarSpinner.style.display = "none";
        entryContestName.textContent = `Entries for ${data.contests.filter(c => c.contest_id == currentContestId)[0].contest_name}`;
        data.contests.forEach((c, idx) => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/entries/${c.contest_id}" id="contest-tab-${c.contest_id}">
                    <i class="fas fa-trophy"></i>
                    <p>
                        ${c.contest_name}
                    </p>
                </a>
            `;
        });
        let navButton = document.querySelector(`#contest-tab-${currentContestId}`);
        navButton.classList.add("selected");
    } else {
        alert(data.error.message);
    }
});

request("get", `/api/internal/entries?contestId=${currentContestId}`, null, (data) => {
    if (!data.error) {
        entriesTable.style.display = "block";
        data.entries.forEach((a, idx) => {
            entriesTableBody.innerHTML += `
            <tr id="${a.entry_id}">
                <td>
                    ${a.entry_id}
                    ${data.logged_in ? a.flagged ? "<i class='fas fa-flag red' title='Flagged'></i>" : "" : ""}
                    ${data.logged_in ? a.disqualified ? "<i class='fas fa-ban red' title='Disqualified'></i>" : "" : ""}
                </td>
                <td>
                    <a href='${a.entry_url}' target='_blank'>${a.entry_title}</a>
                </td>
                <td>
                    ${a.entry_author}
                </td>
                ${data.logged_in
                    ? `
                    <td id="${a.entry_id}-level">
                        <div class="view-entry-level">
                            ${a.entry_level}
                        </div>
                    </td>`
                    : ""
                }
                <td>
                    ${a.entry_created}
                </td>
                ${data.logged_in ? `<td>${a.assigned_group_id ? a.assigned_group_id : "None"}</td>`: ""}
                ${data.is_admin
                    ? `<td id="${a.entry_id}-actions">
                           <i class="control-btn far fa-edit" onclick="showEditEntryForm(${a.entry_id}, '${a.entry_title.replace("'", "").replace('"', '').replace('"', '')}', '${a.entry_author.replace("'", "").replace('"', '').replace('"', '')}', '${a.entry_level}', ${a.assigned_group_id}, ${a.flagged}, ${a.disqualified})"></i>
                           <i class="control-btn red far fa-trash-alt" onclick="deleteEntry(${a.entry_id}, ${a.contest_id})"></i>
                       </td>`
                    : ""
                }
            </tr>`;
        });
        entriesSpinner.style.display = "none";
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/admin/getEvaluatorGroups", null, (data) => {
    if (!data.error) {
        if (data.is_admin) {
            data.evaluatorGroups.forEach(g => {
                if (g.is_active) {
                    groupDropdown.innerHTML += `<option value="${g.group_id}">${g.group_id} - ${g.group_name}</option>`;
                    currentGroupDropdown.innerHTML += `<option value="${g.group_id}">${g.group_id} - ${g.group_name}</option>`;
                    newGroupDropdown.innerHTML += `<option value="${g.group_id}">${g.group_id} - ${g.group_name}</option>`;
                }
            });
        }
    } else {
        alert(data.error.message);
    }
});

///// These send form post requests /////
let editEntry = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.name === "edit_flagged" || key.name === "edit_disqualified") {
            body[key.name] = key.checked;
        } else if (key.name === "edit_entry_group") {
            body[key.name] = null;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("put", "/api/internal/entries", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteEntry = (entry_id, contest_id) => {
    let shouldDelete = confirm("Are you sure you want to delete this entry?");

    if (shouldDelete) {
        request("delete", "/api/internal/entries", {
            entry_id,
            contest_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}
const updateEntries = (contest_id) => {
    request("post", "/api/internal/entries/import", {
        contest_id
    }, (data) => {
        if (!data.error) {
            alert(data.message);
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
};

const addEntry = (contest_id) => {
    let program_id = prompt("Enter the program ID");

    if (program_id) {
        request("get", `https://www.khanacademy.org/api/internal/scratchpads/${program_id}`, {}, (data) => {
            getProgramData(data);
        });
    }
}

const assignEntries = (contest_id) => {
    let shouldAssign = confirm("Are you sure you want to assign all entries to groups? Any entries that are currently assigned may be reassigned. If you need to assign a few entries, edit them individually instead.");

    if (shouldAssign) {
        request("put", "/api/internal/entries/assignToGroups", {
            contest_id,
            assignAll: true
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

const assignNewEntries = (contest_id) => {
    let assignAll = false;

    let shouldAssign = confirm("Are you sure you want to assign new entries to groups? Any entries that are currently unassigned will be assigned a group. If you need to assign a few entries, edit them individually instead.");

    if (shouldAssign) {
        request("put", "/api/internal/entries/assignToGroups", {
            contest_id,
            assignAll
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

const transferEntries = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];

    request("put", "/api/internal/entries/transferEntryGroups", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

const getProgramData = (data) => {
    let contest_id = currentContestId;
    let entry_url = data.url;
    let entry_kaid = entry_url.split("/")[5];
    let entry_title = data.title;
    let entry_author = data.kaid;
    let entry_level = 'TBD';
    let entry_votes = data.sumVotesIncremented;
    let entry_created = data.created;
    let entry_height = data.height;

    request("post", "/api/internal/entries", {
        contest_id,
        entry_url,
        entry_kaid,
        entry_title,
        entry_author,
        entry_level,
        entry_votes,
        entry_created,
        entry_height
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

///// HTML modifier functions (like displaying forms) /////
let showEditEntryForm = (...args) => {
    // id, title, author, skill level, group, flagged, disqualified
    let editEntryPage = document.querySelector("#edit-entry-page");
    let viewEntryPage = document.querySelector("#entry-list");
    let editEntryForm = document.querySelector("#edit-entry-form");
    viewEntryPage.style.display = "none";
    editEntryPage.style.display = "block";

    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editEntryForm.length - 1; i++) {
        if (editEntryForm[i].name === "edit_flagged" || editEntryForm[i].name === "edit_disqualified") {
            editEntryForm[i].checked = args[i];
        } else {
            editEntryForm[i].value = args[i];
        }
    }
};

let showUpdateGroupsForm = () => {
    let updateGroupspage = document.querySelector("#update-entry-groups-page");
    let viewEntryPage = document.querySelector("#entry-list");
    viewEntryPage.style.display = "none";
    updateGroupspage.style.display = "block";
}
