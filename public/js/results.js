let navButtons = document.getElementsByClassName("nav-button");
let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);
navButtons[currentContestId - 1].classList.add("selected");

let addWinner = contest_id => {
    let entry_id = window.prompt("Enter the ID of the entry you want to add:");

    if (entry_id > 0) {
        post("/api/addWinner", {
            entry_id: entry_id,
            contest_id: contest_id
        });
    }
};

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
};