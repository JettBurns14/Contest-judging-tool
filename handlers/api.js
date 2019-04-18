const {
    handleNext,
    jsonMessage,
    successMsg
} = require("../functions");
const db = require("../db");
const Request = require("request");
const Moment = require("moment");

exports.whitelistUser = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let kaid = request.body.kaid;
            let {
                is_admin
            } = request.decodedToken;
            if (is_admin) {
                return db.query("INSERT INTO whitelisted_kaids (kaid) VALUES ($1)", [kaid], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem whitelisting this user");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem whitelisting this user");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.removeWhitelistedUser = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let kaid = request.body.kaid;
            let {
                is_admin
            } = request.decodedToken;
            if (is_admin) {
                return db.query("DELETE FROM whitelisted_kaids WHERE kaid = $1;", [kaid], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem removing this user");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem removing this user");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.editUser = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let edit_evaluator_id = request.body.edit_user_id;
            let edit_evaluator_name = request.body.edit_user_name;
            let edit_evaluator_kaid = request.body.edit_user_kaid;
            let edit_is_admin = request.body.edit_user_is_admin;
            let edit_user_account_locked = request.body.edit_user_account_locked;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE evaluator SET evaluator_name = $1, evaluator_kaid = $2, account_locked = $3, is_admin = $4 WHERE evaluator_id = $5;", [edit_evaluator_name, edit_evaluator_kaid, edit_user_account_locked, edit_is_admin, edit_evaluator_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this user");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this user");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.addContest = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                contest_name,
                contest_url,
                contest_author,
                contest_start_date,
                contest_end_date,
                contest_current
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("INSERT INTO contest (contest_name, contest_url, contest_author, date_start, date_end, current) VALUES ($1, $2, $3, $4, $5, $6)", [contest_name, contest_url, contest_author, contest_start_date, contest_end_date, contest_current], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this contest");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.editContest = (request, response, next) => {
    if (request.decodedToken) {
        try {
            if (request.decodedToken.is_admin) {
                let {
                    edit_contest_id,
                    edit_contest_name,
                    edit_contest_url,
                    edit_contest_author,
                    edit_contest_start_date,
                    edit_contest_end_date,
                    edit_contest_current
                } = request.body;
                let values = [edit_contest_name, edit_contest_url, edit_contest_author, edit_contest_start_date, edit_contest_end_date, edit_contest_current, edit_contest_id];
                return db.query("UPDATE contest SET contest_name = $1, contest_url = $2, contest_author = $3, date_start = $4, date_end = $5, current = $6 WHERE contest_id = $7", values, res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this contest");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.deleteContest = (request, response, next) => {
    if (request.decodedToken) {
        try {
            if (request.decodedToken.is_admin) {
                let {
                    contest_id
                } = request.body;
                return db.query("DELETE FROM contest WHERE contest_id = $1", [contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this contest");
                    };
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.addEntry = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let contest_id = request.body.contest_id;
            let entry_url = request.body.entry_url;
            let entry_kaid = request.body.entry_kaid;
            let entry_title = request.body.entry_title;
            let entry_author = request.body.entry_author;
            let entry_level = request.body.entry_level;
            let entry_votes = request.body.entry_votes;
            let entry_created = request.body.entry_created;
            let entry_height = request.body.entry_height;
            let {
                is_admin,
                evaluator_name
            } = request.decodedToken;

            if (is_admin) {
                return db.query("INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);", [contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this entry");
                    }
                    response.redirect("/entries/" + contest_id);
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

exports.editEntry = (request, response, next) => {
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

exports.deleteEntry = (request, response, next) => {
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

exports.addWinner = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE entry SET is_winner = true WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this winner");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this winner");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.deleteWinner = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                entry_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE entry SET is_winner = false WHERE entry_id = $1", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this winner");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this winner");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.addMessage = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_date,
                message_title,
                message_content
            } = request.body;
            let {
                is_admin,
                evaluator_name
            } = request.decodedToken;

            if (is_admin) {
                return db.query("INSERT INTO messages (message_author, message_date, message_title, message_content) VALUES ($1, $2, $3, $4);", [evaluator_name, message_date, message_title, message_content], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this message");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.editMessage = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_id,
                message_date,
                message_title,
                message_content
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE messages SET message_date = $1, message_title = $2, message_content = $3 WHERE message_id = $4", [message_date, message_title, message_content, message_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this message");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.deleteMessage = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("DELETE FROM messages WHERE message_id = $1", [message_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this message");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.submitEvaluation = (request, response, next) => {
    if (request.decodedToken) {
        try {
            const {
                entry_id,
                creativity,
                complexity,
                quality_code,
                interpretation,
                skill_level
            } = request.body;
            const {
                evaluator_id,
                is_admin
            } = request.decodedToken;
            const values = [entry_id, evaluator_id, (creativity / 2), (complexity / 2), (quality_code / 2), (interpretation / 2), skill_level]
            return db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", values, res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem evaluating this entry");
                }
                if (is_admin) {
                    return db.query("UPDATE entry SET entry_level = $1 WHERE entry_id = $2;", [skill_level, entry_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem setting the skill level of this entry");
                        }
                        // return response.redirect("/judging");
                        successMsg(response);
                    });
                } else {
                    successMsg(response);
                    // return response.redirect("/judging");
                }
            });
        } catch (err) {
            return handleNext(next, 400, "There was a problem evaluating this entry");
        }
    }
    handleNext(next, 401, "Unauthorized");
}

// WIP, could be used to load all entries into DB once contest deadline is past.
exports.updateEntries = (request, response, next) => {
    if (request.decodedToken) {
        let contest_id = request.body.contest_id;

        return db.query("SELECT * FROM contest WHERE contest_id = $1", [contest_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem finding this contest");
            }
            let program_id = res.rows[0].contest_url.split("/")[5];

            return Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${program_id}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
                console.log("Request callback called.");
                if (err) {
                    return handleNext(next, 400, "There was a problem with the request");
                }

                let data = JSON.parse(body);
                if (data) {
                    console.log("Data exists.");
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
                                                query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 400)`;
                                                entryFound = true;
                                            } else {
                                                query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 400)`;
                                            }

                                            if (entryFound) {
                                                return db.query(query, [], res => {
                                                    if (res.error) {
                                                        return handleNext(next, 400, "There was a problem inserting this entry");
                                                    }
                                                    response.redirect("/entries/" + contest_id);
                                                });
                                            }
                                        }
                                    }
                                    response.redirect("/entries/" + contest_id);

                                });
                            } else {
                                let query = "INSERT INTO entry (contest_id, entry_url, entry_kaid, entry_title, entry_author, entry_level, entry_votes, entry_created, entry_height) VALUES"; // Query to be ran later
                                for (var i = 0; i < data.scratchpads.length; i++) {
                                    let program = data.scratchpads[i];

                                    if (i === 0) {
                                        query += `(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 400)`;
                                    } else {
                                        query += `,(${contest_id}, '${program.url}', '${program.url.split("/")[5]}', '${program.title.replace(/\'/g,"\'\'")}', '${program.authorNickname.replace(/\'/g,"\'\'")}', 'TBD', ${program.sumVotesIncremented}, '${program.created}', 400)`;
                                    }
                                }
                                return db.query(query, [], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem inserting this entry");
                                    }
                                    response.redirect("/entries/" + contest_id);
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

module.exports = exports;