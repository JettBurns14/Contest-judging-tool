/** Handlers GETTING, ADDING, EDITING, and DELETING users. **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.get = (request, response, next) => {
    if (request.decodedToken && request.decodedToken.is_admin) {
        let evaluators, kaids;
        return db.query("SELECT * FROM evaluator ORDER BY evaluator_id ASC;", [], res => {
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