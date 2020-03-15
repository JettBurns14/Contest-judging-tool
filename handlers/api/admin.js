/** Handler for admin STATS **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.ping = (request, response, next) => {
    response.send("Pong!");
};

exports.stats = (request, response, next) => {
    if (request.decodedToken) {
        let { evaluator_id } = request.decodedToken;
        let entryCount, reviewedEntriesCount, activeEvaluatorCount, totalEvaluationsCount, totalEvaluationsNeeded;

        // Return private data to the logged in Council.
        return db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND x.evaluator_id = $1 GROUP BY (y.evaluator_name) ORDER BY cnt DESC;", [evaluator_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting your evaluation count");
            }
            // If length > 0, true, else false.
            if (res.rows.length) {
                reviewedEntriesCount = res.rows[0].cnt;
            } else {
                reviewedEntriesCount = 0;
            }
            return db.query("SELECT COUNT(*) FROM evaluator WHERE account_locked = false;", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the active evaluator count");
                }
                activeEvaluatorCount = res.rows[0].count;
                return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a);", [], res => {
		            if (res.error) {
		                return handleNext(next, 400, "There was a problem getting your entry count");
		            }
		            entryCount = res.rows[0].count;
					return db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x	INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id =	(SELECT MAX(a.contest_id) FROM contest a);", [], res => {
	                    if (res.error) {
	                        return handleNext(next, 400, "There was a problem getting the total evaluation count");
	                    }
	                    totalEvaluationsCount = res.rows[0].cnt;
	                    totalEvaluationsNeeded = activeEvaluatorCount * entryCount;
	                    return response.json({
                            entryCount,
                            reviewedEntriesCount,
                            totalEvaluationsNeeded,
                            totalEvaluationsCount
                        });
                    });
                });
            });
        });
    }
    // Dumby data for public presentation that cannot contain private data.
    return response.json({
        entryCount: 100,
        reviewedEntriesCount: 20,
        totalEvaluationsNeeded: 700,
        totalEvaluationsCount: 450
    });
};

exports.getEvaluatorGroups = (request, response, next) => {
    if (request.decodedToken) {
        try {
            if (request.decodedToken.is_admin) {
                return db.query("SELECT * FROM evaluator_group", [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the evaluator groups");
                    }
                    let evaluatorGroups = res.rows;
                    return db.query("SELECT evaluator_id, evaluator_name, group_id FROM evaluator WHERE account_locked = false", [], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the evaluators");
                        }
                        response.json({
                            logged_in: true,
                            is_admin: request.decodedToken.is_admin,
                            evaluatorGroups: evaluatorGroups,
                            evaluators: res.rows
                        });
                    });
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem getting the evaluator groups");
        }
    }
    return handleNext(next, 401, "Unauthorized");
};

exports.addEvaluatorGroup = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                group_name
            } = request.body;
            if (request.decodedToken.is_admin) {
                return db.query("INSERT INTO evaluator_group (group_name, is_active) VALUES ($1, true)", [group_name], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem creating the evaluator groups");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem creating the evaluator groups");
        }
    }
    return handleNext(next, 401, "Unauthorized");
};

exports.editEvaluatorGroup = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                group_id,
                group_name,
                is_active
            } = request.body;
            if (request.decodedToken.is_admin) {
                return db.query("UPDATE evaluator_group SET group_name = $1, is_active = $2 WHERE group_id = $3", [group_name, is_active, group_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem creating the evaluator groups");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem creating the evaluator groups");
        }
    }
    return handleNext(next, 401, "Unauthorized");
};

exports.deleteEvaluatorGroup = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                group_id
            } = request.body;
            if (request.decodedToken.is_admin) {
                return db.query("DELETE FROM evaluator_group WHERE group_id = $1", [group_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting the evaluator groups");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting the evaluator groups");
        }
    }
    return handleNext(next, 401, "Unauthorized");
};

module.exports = exports;
