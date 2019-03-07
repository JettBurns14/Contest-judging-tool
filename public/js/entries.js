const updateEntries = (contest_id) => {
    post("/api/updateEntries", {contest_id: contest_id});
};

const addEntry = (contest_id) => {
    let program_id = prompt("Enter the program ID");

    let s = document.createElement('script');
    s.setAttribute('src', "https://www.khanacademy.org/api/internal/scratchpads/" + program_id + "?callback=getProgramData");
    document.body.appendChild(s);
}

const getProgramData = (data) => {
    let location =  window.location;
    let pos = location.toString().lastIndexOf('/') + 1;
    let contest_id = location.toString().substring(pos);
    let entry_url = data.url;
    let entry_kaid = entry_url.split("/")[5];
    let entry_title = data.title;
    let entry_author = data.kaid;
    let entry_level = 'TBD';
    let entry_votes = data.sumVotesIncremented;
    let entry_created = data.created;
    let entry_height = data.height;

    post("/api/addEntry", {contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height});
}

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
