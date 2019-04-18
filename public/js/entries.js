let navButtons = document.getElementsByClassName("nav-button");
let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);
navButtons[currentContestId - 1].classList.add("selected");

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
    request("post", "/api/editEntry", body, (data) => {
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
        request("post", "/api/deleteEntry", {
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

///// HTML modifier functions (like displaying forms) /////
let showEditEntryForm = (id, elementIndex, contest_id) => {
    let viewEntryLevel = document.querySelectorAll(".view-entry-level")[elementIndex];
    let editEntryLevel = document.querySelectorAll(".edit-entry-level")[elementIndex];
    let editEntryLevelForm = document.querySelectorAll(".edit-entry-level-form")[elementIndex];
    viewEntryLevel.style.display = "none";
    editEntryLevel.style.display = "block";
    editEntryLevelForm[0].value = id;
}