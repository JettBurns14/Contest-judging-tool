let flaggedEntriesTable = document.querySelector("#flagged-entries-table");
let flaggedEntriesTableBody = document.querySelector("#flagged-entries-table-body");
let judgingGroupsTable = document.querySelector("#judging-groups-table");
let judgingGroupsTableBody = document.querySelector("#judging-groups-table-body");
let assignedGroupsTable = document.querySelector("#assigned-groups-table");
let flaggedEntriesSpinner = document.querySelector("#flagged-entries-spinner");
let judgingGroupsSpinner = document.querySelector("#judging-groups-spinner");
let assignedGroupsSpinner = document.querySelector("#assigned-groups-spinner");
let tab = document.querySelector("#sidebar-judging");

// Load page data
request("get", "/api/internal/entries/flagged", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            flaggedEntriesSpinner.style.display = "none";

            if (data.flaggedEntries.length === 0) {
                flaggedEntriesTable.innerHTML = "All flagged entries have been reviewed!"
            } else {
                data.flaggedEntries.forEach(e => {
                    flaggedEntriesTableBody.innerHTML += `
                    <tr id="${e.entry_id}">
                        <td>${e.entry_id}</td>
                        <td><a href="${e.entry_url}" target="_blank">${e.entry_title}</a></td>
                        <td>${e.entry_author}</td>
                        <td>${e.entry_created}</td>
                        <td id="${e.entry_id}-actions" class="flagged-entry-actions">
                            <i class="control-btn fas fa-check green" onclick="approveEntry(${e.entry_id})" title="Approve"></i>
                            <i class="control-btn fas fa-ban red" onclick="disqualifyEntry(${e.entry_id})" title="Disqualify"></i>
                            <i class="control-btn red far fa-trash-alt" onclick="deleteEntry(${e.entry_id}, ${e.contest_id})" title="Delete"></i>
                        </td>
                    </tr>`;
                });
            }
        }
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/admin/getEvaluatorGroups", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            judgingGroupsSpinner.style.display = "none";

            if (data.evaluatorGroups.length === 0) {
                judgingGroupsTable.innerHTML = "No judging groups have been created."
            } else {
                data.evaluatorGroups.forEach(g => {
                    judgingGroupsTableBody.innerHTML += `
                    <tr id="${g.group_id}">
                        <td>${g.group_id}</td>
                        <td>${g.group_name}</td>
                        <td id="${g.group_id}-actions" class="judging-group-actions">
                            <i class="control-btn far fa-edit" onclick="" title="Edit"></i>
                            <i class="control-btn red far fa-trash-alt" onclick="" title="Delete"></i>
                        </td>
                    </tr>`;
                });
            }
        }
    } else {
        alert(data.error.message);
    }
});

// Handle entry action requests
let approveEntry = (entry_id) => {
    request("put", "/api/internal/entries/approve", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let disqualifyEntry = (entry_id) => {
    request("put", "/api/internal/entries/disqualify", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteEntry = (entry_id, contest_id) => {
    let confirmDelete = confirm("Are you sure you want to delete this entry? This action cannot be undone.");

    if (confirmDelete) {
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

// Handle group action requests
let addEvaluatorGroup = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];

    request("post", "/api/internal/admin/addEvaluatorGroup", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let editEvaluatorGroup = () => {
    request("put", "/api/internal/admin/editEvaluatorGroup", {
        group_id,
        group_name,
        is_active
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let deleteEvaluatorGroup = () => {
    request("delete", "/api/internal/admin/deleteEvaluatorGroup", {
        group_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

// Displays forms
let showAddEvaluatorGroupForm = () => {
    let addEvaluatorGroup = document.querySelector("#create-group-page");
    let judgingPage = document.querySelector("#judging-page");
    judgingPage.style.display = "none";
    addEvaluatorGroup.style.display = "block";
}

// Update navbar highlighting
tab.classList.add("selected");
