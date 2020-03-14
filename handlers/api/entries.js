/** Handlers for GETTING, ADDING, EDITING, DELETING, and IMPORTING entries **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const Request = require("request");
const Moment = require("moment");
const { displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
    let contest_id = request.query.contestId;
    // Send back all entry info
    if (request.decodedToken) {
        return db.query("SELECT *, to_char(entry_created, $1) as entry_created FROM entry WHERE contest_id = $2 ORDER BY entry_id", [displayFancyDateFormat, contest_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the entries");
            }
            return response.json({
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                entries: res.rows
            });
        });
    }
    return db.query("SELECT entry_id, contest_id, entry_url, entry_kaid, entry_title, entry_author, to_char(entry_created, $1) as entry_created FROM entry WHERE contest_id = $2 ORDER BY entry_id", [displayFancyDateFormat, contest_id], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the entries");
        }
        return response.json({
            logged_in: false,
            is_admin: false,
            entries: res.rows
        });
    });
};

exports.add = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                contest_id,
                entry_url,
                entry_kaid,
                entry_title,
                entry_author,
                entry_level,
                entry_votes,
                entry_created,
                entry_height
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);", [contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this entry");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.edit = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id,
                edited_level
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE entry SET entry_level = $1 WHERE entry_id = $2;", [edited_level, entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this entry");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.delete = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id,
                contest_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("DELETE FROM evaluation WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this entry's evaluations");
                    }
                    return db.query("DELETE FROM entry WHERE entry_id = $1", [entry_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem deleting this entry");
                        }
                        successMsg(response);
                    });
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

// WIP, could be used to load all entries into DB once contest deadline is past.
exports.import = (request, response, next) => {
    if (request.decodedToken) {
        let contest_id = request.body.contest_id;

        return db.query("SELECT * FROM contest WHERE contest_id = $1", [contest_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem finding this contest");
            }
            let program_id = res.rows[0].contest_url.split("/")[5];

            return Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${program_id}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
                if (err) {
                    return handleNext(next, 400, "There was a problem with the request");
                }

                let data = JSON.parse(body);
                if (data) {
                    // Find most recently created entry for given contest
                    try {
                        return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = $1", [contest_id], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the entry count for this contest");
                            }
                            if (res.rows[0].count > 0) {
                                return db.query("SELECT MAX(entry_created) FROM entry WHERE contest_id = $1", [contest_id], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem getting the most recent entry");
                                    }
                                    let query = "INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES"; // Query to be ran later
                                    let entryFound = false;

                                    for (var i = 0; i < data.scratchpads.length; ++i) {
                                        // moment docs: http://momentjs.com/docs/#/query/
                                        if (Moment(res.rows[0].max).isBefore(data.scratchpads[i].created)) {

                                            let program = data.scratchpads[i];

                                            if (!entryFound) {
                                                query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                                entryFound = true;
                                            } else {
                                                query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                            }

                                            if (entryFound) {
                                                return db.query(query, [], res => {
                                                    if (res.error) {
                                                        return handleNext(next, 400, "There was a problem inserting this entry");
                                                    }
                                                    successMsg(response);
                                                });
                                            }
                                        }
                                    }
                                    successMsg(response);
                                });
                            } else {
                                let query = "INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES"; // Query to be ran later
                                for (var i = 0; i < data.scratchpads.length; i++) {
                                    let program = data.scratchpads[i];

                                    if (i === 0) {
                                        query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                    } else {
                                        query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 600)`;
                                    }
                                }
                                return db.query(query, [], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem inserting this entry");
                                    }
                                    successMsg(response);
                                });
                            }
                        });
                    } catch (err) {
                        return handleNext(next, 400, "There was a problem logging the entry data");
                    }
                } else {
                    return handleNext(next, 400, "There is no parsed JSON data");
                }
            });
        });
    }
    handleNext(next, 401, "Unauthorized");
}

exports.flag = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id
            } = request.body;

                return db.query("UPDATE entry SET flagged = true WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem flagging this entry");
                    }
                    successMsg(response);
                });
        } catch (err) {
            return handleNext(next, 400, "There was a problem flagging this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.disqualify = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id
            } = request.body;

                return db.query("UPDATE entry SET disqualified = true WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem disqualifying this entry");
                    }
                    successMsg(response);
                });
        } catch (err) {
            return handleNext(next, 400, "There was a problem disqualifying this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.approve = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id
            } = request.body;

                return db.query("UPDATE entry SET disqualified = false, flagged = false WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem approving this entry");
                    }
                    successMsg(response);
                });
        } catch (err) {
            return handleNext(next, 400, "There was a problem approving this entry");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

module.exports = exports;
