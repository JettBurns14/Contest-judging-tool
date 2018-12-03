const { checkAccess, handleNext, jsonMessage } = require("../functions");
const db = require("../db");
const Request = require("request");
const Moment = require("moment");

exports.evaluateEntry = (request, response) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    let entry_id = request.body.entry_id;
    let user_id = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    let score_1 = request.body.creativity / 2;
    let score_2 = request.body.complexity / 2;
    let score_3 = request.body.quality_code / 2;
    let score_4 = request.body.interpretation / 2;
    let skill_level = request.body.skill_level;

    try {
        db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", [entry_id, user_id, score_1, score_2, score_3, score_4, skill_level], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem evaluating this entry");
            }
            response.redirect("/judging");
        });
    } catch(err) {
        return handleNext(next, 400, "There was a problem evaluating this entry");
    }
}

// WIP, could be used to load all entries into DB once contest deadline is past.
exports.updateEntries = (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }

    Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${process.env.CONTEST_PROGRAM_ID}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
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
}

exports.login = (request, response, next) => {
    // If requester has no cookie, proceed with logging in, otherwise say they are logged in.
    if (!checkAccess(request)) {
        if (request.body.councilPassword === process.env.COUNCIL_PW) {
            let userId = request.body.evaluator;
            // let username = request.body.evaluator.split(" - ")[1];
            let password = request.body.userPassword;
            // Needs to use a username, not id.
            db.query("SELECT verify_evaluator($1, $2)", [userId, password], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem logging you in");
                }
                if (res.rows[0].verify_evaluator) {
                    db.query("UPDATE evaluator SET logged_in = true WHERE evaluator_id = $1", [userId], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem logging you in");
                        }
                        response.cookie(process.env.COOKIE_1, true, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        response.cookie(process.env.COOKIE_2, userId, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        // response.cookie(process.env.COOKIE_3, username, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        jsonMessage(response, 4, "Welcome!");
                    });
                } else {
                    return handleNext(next, 401, "Account password is incorrect");
                    // jsonMessage(response, 3, "Account password is incorrect");
                }
            });
        } else {
            return handleNext(next, 401, "Council password is incorrect");
            // jsonMessage(response, 2, "Council password is incorrect");
        }
    } else {
        return handleNext(next, 400, "You are already logged in");
        // jsonMessage(response, 1, "Unauthorized");
    }
}

exports.logout = (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }

    let userId = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    console.log(userId);

    db.query("UPDATE evaluator SET logged_in = false WHERE evaluator_id = $1", [userId], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem logging you out");
        }
        response.clearCookie(process.env.COOKIE_1);
        response.clearCookie(process.env.COOKIE_2);
        response.clearCookie(process.env.COOKIE_3);
        response.redirect("/login");
    });
}

module.exports = exports;
