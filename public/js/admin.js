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

edituser = (id, name, kaid, is_admin, account_locked) => {
  var inputFields = document.querySelectorAll("#edit-user-page input");

  inputFields[0].setAttribute("value", id);
  inputFields[1].setAttribute("value", name);
  inputFields[2].setAttribute("value", kaid);

  if (is_admin) {
    inputFields[3].setAttribute("checked", true);
  }

  if (account_locked) {
    inputFields[4].setAttribute("checked", true);
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
