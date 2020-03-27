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
    let userId = parseInt(request.query.userId);
    let contestId = request.query.contestId;

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

exports.put = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                edit_evaluation_id,
                edit_creativity,
                edit_complexity,
                edit_execution,
                edit_interpretation,
                edit_evaluation_level
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            // Get the user to whom this evaluation belongs to
            return db.query("SELECT evaluator_id FROM evaluation WHERE evaluation_id = $1", [edit_evaluation_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting this evaluation's owner");
                }

                let owner = res.rows[0].evaluator_id;

                if (owner === request.decodedToken.evaluator_id || is_admin) {
                    return db.query("UPDATE evaluation SET creativity = $1, complexity = $2, execution = $3, interpretation = $4, evaluation_level = $5 WHERE evaluation_id = $6", [edit_creativity, edit_complexity, edit_execution, edit_interpretation, edit_evaluation_level, edit_evaluation_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem editing this evaluation");
                        }
                        successMsg(response);
                    });
                } else {
                    return handleNext(next, 403, "Insufficient access");
                }
            });
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this evaluation");
        }
    }
    return handleNext(next, 403, "Insufficient access");
};

exports.delete = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                evaluation_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("DELETE FROM evaluation WHERE evaluation_id = $1", [evaluation_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this evaluation");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this evaluation");
        }
    }
    return handleNext(next, 403, "Insufficient access");
};

module.exports = exports;
