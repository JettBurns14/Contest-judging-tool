/** Handlers for ADDING, and DELETING contest winners **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.add = (request, response, next) => {
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

exports.delete = (request, response, next) => {
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

module.exports = exports;