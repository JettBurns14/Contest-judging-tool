/** Handlers for GETTING, EDITING, and DELETING evaluations **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const Request = require("request");
const Moment = require("moment");
const { displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
    let userId = request.query.userId;
    let contestId = request.query.contestId;

    // Send back all entry info
    if (request.decodedToken) {
        if (userId && contestId) {
            if (userId === request.decodedToken.evaluator_id || request.decodedToken.is_admin) {
                return db.query("SELECT evn.evaluation_id, evn.entry_id, evn.creativity, evn.complexity, evn.execution, evn.interpretation, evn.evaluation_level, en.entry_title, en.entry_url FROM evaluation evn INNER JOIN evaluator evl ON evn.evaluator_id = evl.evaluator_id INNER JOIN entry en ON en.entry_id = evn.entry_id WHERE evn.evaluation_complete = true AND en.contest_id = $1 AND evn.evaluator_id = $2;", [contestId, userId], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting this user's evaluations for the given contest");
                    }
                    return response.json({
                        logged_in: true,
                        is_admin: request.decodedToken.is_admin,
                        evaluations: res.rows
                    });
                });
            }
            return handleNext(next, 403, "Insufficient access");
        }
        return handleNext(next, 400, "Invalid Inputs: userId and contestId expected");
    }
    return handleNext(next, 403, "Insufficient access");
};

module.exports = exports;
