let navButtons = document.getElementsByClassName("nav-button");
let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);
navButtons[currentContestId - 1].classList.add("selected");

let deleteEntry = (id, contest_id) => {
    let shouldDelete = confirm("Are you sure you want to delete this entry?");

    if (shouldDelete) {
        post("/api/deleteEntry", {
            "entry_id": id,
            "contest_id": contest_id
        });
    }
}

let editEntry = (id, elementIndex, contest_id) => {
    let viewEntryLevel = document.querySelectorAll(".view-entry-level")[elementIndex];
    let editEntryLevel = document.querySelectorAll(".edit-entry-level")[elementIndex];
    let editEntryLevelForm = document.querySelectorAll(".edit-entry-level-form")[elementIndex];
    viewEntryLevel.style.display = "none";
    editEntryLevel.style.display = "block";
    editEntryLevelForm[0].value = contest_id;
    editEntryLevelForm[1].value = id;
}

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