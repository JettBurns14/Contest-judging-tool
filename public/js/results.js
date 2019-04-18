let navButtons = document.getElementsByClassName("nav-button");
let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);
navButtons[currentContestId - 1].classList.add("selected");

let addWinner = () => {
    let entry_id = window.prompt("Enter the ID of the entry you want to add:");
    entry_id = +entry_id;
    contest_id = +contest_id;

    if (entry_id > 0) {
        request("post", "/api/addWinner", {
            entry_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    } else {
        window.alert("Entry ID must be > 0");
    }
};

let deleteWinner = entry_id => {
    let shouldDelete = confirm("Are you sure you want to delete this winner?");

    if (shouldDelete) {
        request("post", "/api/deleteWinner", {
            entry_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
};