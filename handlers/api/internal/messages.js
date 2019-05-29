/** Handlers for ADDING, EDITING, and DELETING messages **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.add = (request, response, next) => {
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

exports.edit = (request, response, next) => {
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

exports.delete = (request, response, next) => {
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

module.exports = exports;