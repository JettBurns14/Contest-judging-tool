const { isLoggedIn, handleNext, jsonMessage, getJWTToken } = require("../functions");
const db = require("../db");
const Request = require("request");
const Moment = require("moment");

exports.evaluateEntry = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    let entry_id = request.body.entry_id;
    let score_1 = request.body.creativity / 2;
    let score_2 = request.body.complexity / 2;
    let score_3 = request.body.quality_code / 2;
    let score_4 = request.body.interpretation / 2;
    let skill_level = request.body.skill_level;

    try {
        getJWTToken(request)
            .then(payload => {
                db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", [entry_id, payload.evaluator_id, score_1, score_2, score_3, score_4, skill_level], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem evaluating this entry");
                    }
                    response.redirect("/judging");
                });
            })
            .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, "There was a problem evaluating this entry");
    }
}

exports.whitelistUser = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let kaid = request.body.kaid;

        getJWTToken(request)
            .then(payload => {
              if (payload.is_admin) {
                db.query("INSERT INTO whitelisted_kaids (kaid) VALUES ($1)", [kaid], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem whitelisting this user");
                    }
                    response.redirect("/admin");
                });
              }
              else {
                return handleNext(next, 403, "Insufficient access");
              }
            })
            .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, "There was a problem whitelisting this user");
    }
}

exports.removeWhitelistedUser = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let kaid = request.body.kaid;

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("DELETE FROM whitelisted_kaids WHERE kaid = $1;", [kaid], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem removing this user");
                  }
                  response.redirect("/admin");
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, "There was a problem removing this user");
    }
}

exports.editUser = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      console.log(request.body);
      let evaluator_id = request.body.edit_user_id;
      let evaluator_name = request.body.edit_user_name;
      let evaluator_kaid = request.body.edit_user_kaid;
      let is_admin = request.body.edit_user_is_admin;
      let account_locked = request.body.edit_account_locked;

      // Change to boolean data type
    	if (is_admin == 'true') {
    		is_admin = true;
    	}
    	else {
    	 is_admin = false;
    	}

    	if (account_locked == 'true') {
    		account_locked = true;
    	}
    	else {
    		account_locked = false;
    	}

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("UPDATE evaluator SET evaluator_name = $1, evaluator_kaid = $2, account_locked = $3, is_admin = $4 WHERE evaluator_id = $5;", [evaluator_name, evaluator_kaid, account_locked, is_admin, evaluator_id], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem editing this user");
                  }
                  response.redirect("/admin");
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));

    } catch(err) {
        return handleNext(next, 400, "There was a problem editing this user");
    }
}

exports.addContest = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let contest_name = request.body.contest_name;
      let contest_URL = request.body.contest_url;
      let contest_author = request.body.contest_author;
      let contest_start_date = request.body.contest_start_date;
      let contest_end_date = request.body.contest_end_date;

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("INSERT INTO contest (contest_name, contest_url, contest_author, date_start, date_end) VALUES ($1, $2, $3, $4, $5)", [contest_name, contest_URL, contest_author, contest_start_date, contest_end_date], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem adding this contest");
                  }
                  response.redirect("/admin");
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));

    } catch(err) {
        return handleNext(next, 400, "There was a problem adding this contest");
    }
}

exports.editEntry = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let entry_id = request.body.entry_id;
      let entry_level = request.body.edited_level;
      let contest_id = request.body.contest_id;

      let next_entry = 1 + parseInt(entry_id);

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("UPDATE entry SET entry_level = $1 WHERE entry_id = $2;", [entry_level, entry_id], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem editing this entry");
                  }
                  response.redirect("/entries/" + contest_id + "#" + next_entry);
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));

    } catch(err) {
        return handleNext(next, 400, "There was a problem adding this user");
    }
}

exports.deleteEntry = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let entry_id = request.body.entryId;
      let contest_id = request.body.contest_id

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("DELETE FROM entry WHERE entry_id = $1", [entry_id], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem deleting this entry");
                  }
                  response.redirect("/entries/" + contest_id);
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));

    } catch(err) {
        return handleNext(next, 400, "There was a problem deleting this user");
    }
}

exports.addWinner = (request, response) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    try {
      let entry_id = request.body.entryId;
      let contest_id = request.body.contest_id;

      getJWTToken(request)
          .then(payload => {
            if (payload.is_admin) {
              db.query("UPDATE entry SET is_winner = true WHERE entry_id = $1", [entry_id], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem adding this winner");
                  }
                  response.redirect("/results/" + contest_id);
              });
            }
            else {
              return handleNext(next, 403, "Insufficient access");
            }
          })
          .catch(err => handleNext(next, 400, err));

    } catch(err) {
        return handleNext(next, 400, "There was a problem adding this winner");
    }
}

// WIP, could be used to load all entries into DB once contest deadline is past.
exports.updateEntries = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    db.query("SELECT * FROM contest WHERE current = true", [], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the current contest");
        }
        let contest_id = res.rows[0].contest_url.split("/")[5];

        Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${contest_id}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
            console.log("Request callback called.");
            if (!JSON.parse(body)) {
                return handleNext(next, 400, "No request body received");
            } else
            if (err) {
                return handleNext(next, 400, "There was a problem with the request");
            }

            let data = JSON.parse(body);
            if (data) {
                console.log("Data exists.");
                // When data is received (which is sorted already)...
                // SELECT all current entries in DB table.
                // Sort current table entries by created date.
                // Get most recent entry from table, TOP().
                try {
                    db.query("SELECT MAX(entry_created) FROM entry", [], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the most recent entry");
                        }
                        console.log("Query callback called.");
                        // Handle error
                        console.log(`${res.rows[0].max} --- ${data.scratchpads.length} new programs.`);
                        for (var i = 0; i < data.scratchpads.length; ++i) {
                            // moment docs: http://momentjs.com/docs/#/query/
                            if (Moment(res.rows[0].max).isBefore(data.scratchpads[i].created)) {
                                //console.log(`Program ${data.scratchpads[i].title} was created after ${res.rows[0].max} on ${data.scratchpads[i].created}.`);
                                console.log(`${data.scratchpads[i].created} - ${data.scratchpads[i].url}`)
                            }
                            // console.log(`Program "${data.scratchpads[i].title}" created on ${data.scratchpads[i].created}. ${Moment(res.rows[0].max).isBefore(data.scratchpads[i].created)}`);
                        }
                        // Store all API entries created after this returned date.
                        // Loop through entries, and check if each moment(res.row).isBefore(data[i].created)
                    });
                } catch(err) {
                    return handleNext(next, 400, "There was a problem logging the entry data");
                }
                // Now compare most recent table entry creation date to all dates in API entries.
                // If programs have been created since the most recent in table, store them.
                // Once all have been compared, INSERT stored entries into table.
            } else {
                return handleNext(next, 400, "There is no parsed JSON data");
            }
        });
    });
}

module.exports = exports;
