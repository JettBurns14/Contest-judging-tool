let navButtons = document.getElementsByClassName("nav-button");
let pages = document.getElementsByClassName("page-content");
let updateButton = document.getElementById("update-entries-button");

const showpage = (page) => {
    for (var i = 0; i < pages.length; ++i) {
        pages[i].style.display = "none";
    }
    for(var i = 0; i < navButtons.length; ++i) {
        navButtons[i].classList.remove("selected");
    }

    if (page <= 6) {
      navButtons[page].classList.add("selected");
    }

    pages[page].style.display = "block";
    if (page == 0) {
        pages[page].style.display = "flex";
    }
};
showpage(0);

updateButton.addEventListener("click", () => {
    alert("This isn\'t set up yet.");
});

function removeWhitelistedUser(kaid) {
  var approval = window.confirm("Are you sure you want to remove this user from the whitelist?");
  console.log(kaid);

  if (approval) {
    post('/api/removeWhitelistedUser', {kaid: kaid});
  }
}

const formatDate = (date) => {
    var d = date.split(" ");
    var month = "";
    switch (d[1]) {
        case "Jan":
            month = "01";
            break;
        case "Feb":
            month = "02";
            break;
        case "Mar":
            month = "03";
            break;
        case "Apr":
            month = "04";
            break;
        case "May":
            month = "05";
            break;
        case "Jun":
            month = "06";
            break;
        case "Jul":
            month = "07";
            break;
        case "Aug":
            month = "08";
            break;
        case "Sep":
            month = "09";
            break;
        case "Oct":
            month = "10";
            break;
        case "Nov":
            month = "11";
            break;
        case "Dec":
            month = "12";
            break;
    }

    return d[3] + "-" + month + "-" + d[2];
};

const editContest = (contest_id, contest_name, contest_url, contest_author, contest_start_date, contest_end_date) => {
    var inputFields = document.querySelectorAll("#edit-contest-page input");

    inputFields[0].setAttribute("value", contest_id);
    inputFields[1].setAttribute("value", contest_name);
    inputFields[2].setAttribute("value", contest_url);
    inputFields[3].setAttribute("value", contest_author);
    inputFields[4].setAttribute("value", formatDate(contest_start_date));
    inputFields[5].setAttribute("value", formatDate(contest_end_date));
};

const deleteContest = (contest_id) => {
    var approval = window.confirm("Are you sure you want to delete this contest? This action cannot be undone, and will remove all entries and evaluations for this contest.");

    if (approval) {
      post('/api/deleteContest', {contest_id: contest_id});
    }
};

edituser = (id, name, kaid, is_admin, account_locked) => {
    var inputFields = document.querySelectorAll("#edit-user-page input");
    var formOptions = document.querySelectorAll("option");

    inputFields[0].setAttribute("value", id);
    inputFields[1].setAttribute("value", name);
    inputFields[2].setAttribute("value", kaid);

    if (is_admin) {
        formOptions[0].setAttribute("selected", true);
    } else {
        formOptions[1].setAttribute("selected", true);
    }

    if (account_locked) {
        formOptions[2].setAttribute("selected", true);
    } else {
        formOptions[3].setAttribute("selected", true);
    }
};


// Send post requests without visible form element
function post(path, params, method) {
  method = method || "post"; // Set method to post by default if not specified.

  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
      if(params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
      }
  }

  document.body.appendChild(form);
  form.submit();
}
