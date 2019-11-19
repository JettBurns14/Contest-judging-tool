/** Handlers GETTING, ADDING, EDITING, and DELETING users. **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
    if (request.decodedToken && request.decodedToken.is_admin) {
        let evaluators, kaids;
        return db.query("SELECT *, to_char(e.logged_in_tstz, $1) as logged_in_tstz, to_char(e.dt_term_start, $1) as dt_term_start, to_char(e.dt_term_end, $1) as dt_term_end FROM evaluator e ORDER BY evaluator_id ASC;", [displayDateFormat], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the evaluators");
            }
            evaluators = res.rows;
            return db.query("SELECT * FROM whitelisted_kaids;", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the whitelisted kaids");
                }
                kaids = res.rows;
                return response.json({
                    logged_in: true,
                    is_admin: request.decodedToken.is_admin,
                    kaids,
                    evaluators
                });
            });
        });
    }
    response.json({
        is_admin: false,
    });
};

// Add user to whitelist.
exports.add = (request, response, next) => {
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

exports.edit = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let edit_evaluator_id = request.body.edit_user_id;
            let edit_evaluator_name = request.body.edit_user_name;
            let edit_evaluator_kaid = request.body.edit_user_kaid;
            let edit_evaluator_username = request.body.edit_user_username;
            let edit_evaluator_nickname = request.body.edit_user_nickname;
            let edit_evaluator_email = request.body.edit_user_email;
            let edit_evaluator_start = request.body.edit_user_start;
            let edit_evaluator_end = request.body.edit_user_end;
            let edit_is_admin = request.body.edit_user_is_admin;
            let edit_user_account_locked = request.body.edit_user_account_locked;
            let {
                is_admin
            } = request.decodedToken;

            // Handle null dates
            if (edit_evaluator_start === "null")
            {
                edit_evaluator_start = null;
            }
            if (edit_evaluator_end === "null")
            {
                edit_evaluator_end = null;
            }

            if (is_admin) {
                return db.query("UPDATE evaluator SET evaluator_name = $1, evaluator_kaid = $2, username = $3, nickname = $4, email = $5, dt_term_start = $6, dt_term_end = $7, account_locked = $8, is_admin = $9 WHERE evaluator_id = $10;", [edit_evaluator_name, edit_evaluator_kaid, edit_evaluator_username, edit_evaluator_nickname, edit_evaluator_email, edit_evaluator_start, edit_evaluator_end, edit_user_account_locked, edit_is_admin, edit_evaluator_id], res => {
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

// Remove whitelisted user.
exports.delete = (request, response, next) => {
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

module.exports = exports;
