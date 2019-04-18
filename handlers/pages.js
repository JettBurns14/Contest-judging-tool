const {
    handleNext,
    jsonMessage
} = require("../functions");
const db = require("../db");
const dateFormat = "FMMM-FMDD-YYYY";
const fancyDateFormat = "FMMM-FMDD-YYYY FMHH12:FMMI:FMSS AM";

exports.home = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let messages;
            let {
                is_admin,
                evaluator_name
            } = request.decodedToken;
            return db.query("SELECT *, to_char(m.message_date, $1) as message_date FROM messages m ORDER BY m.message_date ASC", [dateFormat], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the messages");
                }
                messages = res.rows;
                response.render("pages/home", {
                    messages,
                    is_admin,
                    evaluator_name
                });
            });
        } catch (err) {
            return handleNext(next, 400, err);
        }
    }
    response.redirect("/login");
}

exports.login = (request, response) => {
    if (request.decodedToken) {
        return response.redirect("/");
    }
    response.render("pages/login", {
        evaluator_name: false
    });
}

exports.judging = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                evaluator_id,
                evaluator_name
            } = request.decodedToken;
            return db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [evaluator_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting an entry");
                }
                return response.render("pages/judging", {
                    entry: res.rows[0],
                    evaluator_name
                });
            });
        } catch (err) {
            return handleNext(next, 400, err);
        }
    }
    // Instead, show the public page version.
    handleNext(next, 401, "Unauthorized");
}

exports.admin = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let entryCount, reviewedCount, contests, evaluators, whitelisted_kaids, activeEvaluatorCount, totalEvaluationsCount, totalEntryCount, totalEvaluationsNeeded;
            let {
                evaluator_id,
                evaluator_name,
                is_admin
            } = request.decodedToken;

            return db.query("SELECT COUNT(*) FROM entry WHERE contest_id = (SELECT MAX(a.contest_id) FROM contest a);", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting your entry count");
                }
                entryCount = res.rows[0].count;
                db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id = (SELECT MAX(a.contest_id) FROM contest a) AND x.evaluator_id = $1 GROUP BY (y.evaluator_name) ORDER BY cnt DESC;", [evaluator_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting your evaluation count");
                    }
                    // If length > 0, true, else false.
                    if (res.rows.length) {
                        reviewedCount = res.rows[0].cnt;
                    } else {
                        reviewedCount = 0;
                    }
                    db.query("SELECT *, to_char(date_start, $1) as date_start, to_char(date_end, $2) as date_end FROM contest ORDER BY contest_id DESC", [dateFormat, dateFormat], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the contests");
                        }
                        contests = res.rows;
                        db.query("SELECT * FROM evaluator ORDER BY evaluator_name, account_locked DESC;", [], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the evaluators");
                            }
                            evaluators = res.rows;
                            db.query("SELECT * FROM whitelisted_kaids;", [], res => {
                                if (res.error) {
                                    return handleNext(next, 400, "There was a problem getting the whitelisted kaids");
                                }
                                whitelisted_kaids = res.rows;
                                db.query("SELECT COUNT(*) FROM evaluator WHERE account_locked = false;", [], res => {
                                    if (res.error) {
                                        return handleNext(next, 400, "There was a problem getting the active evaluator count");
                                    }
                                    activeEvaluatorCount = res.rows[0].count;
                                    db.query("SELECT COUNT(x.entry_id) as cnt FROM evaluation x	INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id =	(SELECT MAX(a.contest_id) FROM contest a);", [], res => {
                                        if (res.error) {
                                            return handleNext(next, 400, "There was a problem getting the total evaluation count");
                                        }
                                        totalEvaluationsCount = res.rows[0].cnt;
                                        db.query("SELECT COUNT(*) FROM entry WHERE contest_id =	(SELECT MAX(a.contest_id) FROM contest a);", [], res => {
                                            if (res.error) {
                                                return handleNext(next, 400, "There was a problem getting the total entry count");
                                            }
                                            totalEntryCount = res.rows[0].count;
                                            totalEvaluationsNeeded = activeEvaluatorCount * totalEntryCount;
                                            response.render("pages/admin", {
                                                evaluator_name,
                                                entryCount,
                                                reviewedCount,
                                                contests,
                                                evaluators,
                                                whitelisted_kaids,
                                                totalEvaluationsNeeded,
                                                totalEvaluationsCount,
                                                is_admin
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } catch (err) {
            return handleNext(next, 400, err);
        }
    }
    handleNext(next, 401, "Unauthorized");
}

exports.profile = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/profile", {
            evaluator_name: request.decodedToken.evaluator_name
        });
    }
    handleNext(next, 400, "Unauthorized");
}

exports.results = (request, response, next) => {
    if (request.decodedToken) {
        let contest_id = request.params.contestId;
        let {
            evaluator_name,
            is_admin
        } = request.decodedToken;
        let contests, evaluationsPerLevel, entriesByAvgScore, entryCount, evaluationsPerEvaluator, winners;

        return db.query("SELECT contest_id, contest_name FROM contest ORDER BY contest_id;", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the results kaids");
            }
            contests = res.rows;
            db.query("SELECT x.evaluation_level, COUNT(x.evaluation_level) as cnt FROM evaluation x	INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete = true AND z.contest_id =" + contest_id + "GROUP BY (x.evaluation_level) ORDER BY (	CASE x.evaluation_level	WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END);", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the results kaids");
                }
                evaluationsPerLevel = res.rows;
                db.query(`SELECT REPLACE(z.entry_title,'"',''), z.entry_id, z.entry_author, z.entry_url, z.entry_level, COUNT(z.entry_title) as evaluations,	MIN(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) as min_level_numeric,	CASE MIN(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) WHEN 0 THEN 'Beginner'	WHEN 1 THEN 'Intermediate' ELSE 'Advanced' END as min_level, CASE MAX(CASE x.evaluation_level WHEN 'Beginner' THEN 0 WHEN 'Intermediate' THEN 1 ELSE 2 END) WHEN 0 THEN 'Beginner'	WHEN 1 THEN 'Intermediate'	ELSE 'Advanced'	END as max_level,	AVG(x.creativity+x.complexity+x.execution+x.interpretation) as avg_score, MIN(x.creativity+x.complexity+x.execution+x.interpretation) as min_score,	MAX(x.creativity+x.complexity+x.execution+x.interpretation) as max_score	FROM evaluation x	INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id	INNER JOIN entry z ON z.entry_id = x.entry_id	WHERE x.evaluation_complete	AND z.contest_id = ` + contest_id + ` GROUP BY (z.entry_title, z.entry_id, z.entry_author, z.entry_url, z.entry_level)	ORDER BY z.entry_level ASC, avg_score DESC;`, [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the results kaids");
                    }
                    entriesByAvgScore = res.rows;
                    db.query("SELECT COUNT(*) FROM entry WHERE contest_id = $1", [contest_id], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the results kaids");
                        }
                        entryCount = res.rows;
                        db.query("SELECT y.evaluator_name, COUNT(x.entry_id) as cnt FROM evaluation x INNER JOIN evaluator y ON y.evaluator_id = x.evaluator_id INNER JOIN entry z ON z.entry_id = x.entry_id WHERE x.evaluation_complete = true AND z.contest_id =" + request.params.contestId + "GROUP BY (y.evaluator_name) ORDER BY cnt DESC;", [], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the results kaids");
                            }
                            evaluationsPerEvaluator = res.rows;
                            db.query("SELECT * FROM entry WHERE contest_id = $1 AND is_winner = true ORDER BY entry_level", [contest_id], res => {
                                if (res.error) {
                                    return handleNext(next, 400, "There was a problem getting the results kaids");
                                }
                                winners = res.rows;
                                response.render("pages/results", {
                                    evaluator_name,
                                    contests,
                                    evaluationsPerLevel,
                                    entriesByAvgScore,
                                    entryCount,
                                    evaluationsPerEvaluator,
                                    winners,
                                    contest_id,
                                    is_admin
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    return handleNext(next, 400, "Unauthorized");
}

exports.entries = (request, response, next) => {
    if (request.decodedToken) {
        let contest_id = request.params.contestId;
        let {
            evaluator_name,
            is_admin
        } = request.decodedToken;
        let contests, entries;

        return db.query("SELECT contest_id, contest_name FROM contest ORDER BY contest_id;", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the contests");
            }
            contests = res.rows;
            db.query("SELECT *, to_char(entry_created, $1) as entry_created FROM entry WHERE contest_id = $2 ORDER BY entry_id", [fancyDateFormat, contest_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the entries");
                }
                entries = res.rows;
                response.render("pages/entries", {
                    contests,
                    entries,
                    contest_id,
                    is_admin,
                    evaluator_name
                });
            });
        });
    }
    return handleNext(next, 400, "Unauthorized");
}

module.exports = exports;