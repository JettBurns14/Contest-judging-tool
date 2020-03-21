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

request("get", "/api/internal/contests", null, (data) => {
    if (!data.error) {
        sidebarSpinner.style.display = "none";
        entryContestName.textContent = `Entries for ${data.contests.filter(c => c.contest_id == currentContestId)[0].contest_name}`;
        data.contests.forEach((c, idx) => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/entries/${c.contest_id}">
                    <i class="fas fa-trophy"></i>
                    <p>
                        ${c.contest_name}
                    </p>
                </a>
            `;
        });
        let navButtons = document.querySelectorAll(".nav-button");
        navButtons[navButtons.length - currentContestId].classList.add("selected");
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
                        <div class="edit-entry-level">
                            <form class="edit-entry-level-form" onSubmit="return editEntry(event)">
                                <input type="hidden" name="entry_id">
                                <select name="edited_level">
                                    <option value="tbd">TBD</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                                <button class="check-icon">
                                    <i class="fas fa-check"></i>
                                </button>
                            </form>
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
                           <i class="control-btn far fa-edit" onclick="showEditEntryForm(${a.entry_id}, ${idx}, ${a.contest_id})"></i>
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

///// These send form post requests /////
let editEntry = (e) => {
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
let showEditEntryForm = (id, elementIndex, contest_id) => {
    let viewEntryLevel = document.querySelectorAll(".view-entry-level")[elementIndex];
    let editEntryLevel = document.querySelectorAll(".edit-entry-level")[elementIndex];
    let editEntryLevelForm = document.querySelectorAll(".edit-entry-level-form")[elementIndex];
    viewEntryLevel.style.display = "none";
    editEntryLevel.style.display = "block";
    editEntryLevelForm[0].value = id;
}
