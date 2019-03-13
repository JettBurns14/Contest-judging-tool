var navButtons = document.getElementsByClassName('nav-button');
navButtons[<%= contest_id %> - 1].classList.add('selected');

function deleteEntry(id, contest_id) {
	var shouldDelete = confirm("Are you sure you want to delete this entry?");

	if (shouldDelete) {
		post('/api/deleteEntry', {
			'entry_id': id,
			'contest_id': contest_id
		});
	}
}

function editEntry(id) {
	var row = document.getElementById(id);
	var entryLevelBox = document.getElementById(id + '-level');
	var currentLevel = entryLevelBox.innerHTML;
	var actionBox = document.getElementById(id + '-actions');

	entryLevelBox.innerHTML = "<form method='post' action='/api/editEntry'><input type='hidden' name='contest_id' value='<%= contest_id %>'><input type='hidden' name='entry_id' value='" + id + "'><select name='edited_level'><option value='tbd'>TBD</option><option value='Beginner'>Beginner</option><option value='Intermediate'>Intermediate</option><option value='Advanced'>Advanced</option></select><input class='check-icon' type='image' src='../static/images/checkmark.png' border='0' alt='Submit'/></form>";
}

function post(path, params, method) {
	method = method || "post"; // Set method to post by default if not specified.

	// The rest of this code assumes you are not using a library.
	// It can be made less wordy if you use one.
	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for (var key in params) {
		if (params.hasOwnProperty(key)) {
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