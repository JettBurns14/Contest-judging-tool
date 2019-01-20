const { isLoggedIn, handleNext, jsonMessage, getJWTToken } = require("../functions");
const db = require("../db");

exports.home = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
      let messages;
        getJWTToken(request)
            .then(payload => {
                db.query("SELECT * FROM messages", [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the messages");
                    }
                    messages = res.rows;
                    response.render("pages/home", { messages, is_admin: payload.is_admin, evaluator_name: payload.evaluator_name });
                });
            })
            .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, err);
    }
}

exports.login = (request, response) => {
    if (isLoggedIn(request)) {
        return response.redirect("/");
    }
    response.render("pages/login");
}

exports.judging = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
        getJWTToken(request)
            .then(payload => {
                db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [payload.evaluator_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting an entry");
                    }
                    response.render("pages/judging", { entry: res.rows[0] });
                });
            })
            .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, err);
    }
}

exports.admin = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
        let entryCount, reviewedCount, contests, evaluators, whitelisted_kaids;

        // TODO: Add results to a new table? Maybe add results link to contests table.
        // TODO: Get count of only this contest's entries.
        getJWTToken(request)
            .then(payload => {
              db.query("SELECT COUNT(*) FROM entry", [], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem getting the number of entries");
                  }
                  entryCount = res.rows[0].count;
                  // TODO: Get count of only this contest's evals.
                  db.query("SELECT COUNT(*) FROM evaluation WHERE evaluation_complete = true", [], res => {
                      if (res.error) {
                          return handleNext(next, 400, "There was a problem getting the evaluations");
                      }
                      reviewedCount = res.rows[0].count;
                      db.query("SELECT * FROM contest ORDER BY contest_id DESC", [], res => {
                          if (res.error) {
                              return handleNext(next, 400, "There was a problem getting the contests");
                          }
                          contests = res.rows;
                          db.query("SELECT * FROM evaluator ORDER BY evaluator_name, account_locked DESC;", [], res => {
                              if (res.error) {
                                  return handleNext(next, 400, "There was a problem getting the entries");
                              }
                              evaluators = res.rows;
                              db.query("SELECT * FROM whitelisted_kaids;", [], res => {
                                  if (res.error) {
                                      return handleNext(next, 400, "There was a problem getting the whitelisted kaids");
                                  }
                                  whitelisted_kaids = res.rows;
                                  response.render("pages/admin", { entryCount, reviewedCount, contests, evaluators, whitelisted_kaids, is_admin: payload.is_admin });
                              });
                          });
                      });
                  });
              });
            })
            .catch(err => handleNext(next, 400, err));
    } catch(err) {
        return handleNext(next, 400, err);
    }
}

exports.profile = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 400, "Unauthorized");
    }
    getJWTToken(request)
        .then(payload => {
            response.render("pages/profile", { evaluator_name: payload.evaluator_name });
        })
        .catch(err => handleNext(next, 400, err));
}

exports.results = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 400, "Unauthorized");
    }

    let contest_id = request.params.contestId;
    let contests, evaluationsPerLevel, entriesByAvgScore, entryCount, evaluationsPerEvaluator, winners;

    getJWTToken(request)
        .then(payload => {
          db.query("SELECT contest_id, contest_name FROM contest;", [], res => {
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
                                  response.render("pages/results", { contests, evaluationsPerLevel, entriesByAvgScore, entryCount, evaluationsPerEvaluator, winners, contest_id: contest_id, is_admin: payload.is_admin });
                              });
                          });
                      });
                  });
              });
          });
        })
        .catch(err => handleNext(next, 400, err));
}

exports.entries = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 400, "Unauthorized");
    }

    let contest_id = request.params.contestId;
    let contests, entries;

    getJWTToken(request)
        .then(payload => {
          db.query("SELECT contest_id, contest_name FROM contest;", [], res => {
              if (res.error) {
                  return handleNext(next, 400, "There was a problem getting the contests kaids");
              }
              contests = res.rows;
              db.query("SELECT * FROM entry WHERE contest_id = $1 ORDER BY entry_id", [contest_id], res => {
                  if (res.error) {
                      return handleNext(next, 400, "There was a problem getting the whitelisted kaids");
                  }
                  entries = res.rows;
                  response.render("pages/entries", { contests, entries, contest_id: contest_id, is_admin: payload.is_admin });

              });
           });
        })
        .catch(err => handleNext(next, 400, err));
}

module.exports = exports;
