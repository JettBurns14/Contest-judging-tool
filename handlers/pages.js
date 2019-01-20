const { handleNext, jsonMessage } = require("../functions");
const db = require("../db");

exports.home = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/home", { evaluator_name: request.decodedToken.evaluator_name });
    }
    handleNext(next, 401, "Unauthorized");
}

exports.login = (request, response) => {
    if (request.decodedToken) {
        return response.redirect("/");
    }
    response.render("pages/login", { evaluator_name: false });
}

exports.judging = (request, response, next) => {
    if (request.decodedToken) {
        try {
            return db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [request.decodedToken.evaluator_id], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting an entry");
                }
                return response.render("pages/judging", { entry: res.rows[0], evaluator_name: request.decodedToken.evaluator_name });
            });
        } catch(err) {
            return handleNext(next, 400, err);
        }
    }
    // Instead, show the public page version.
    handleNext(next, 401, "Unauthorized");
}

exports.admin = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let entryCount, reviewedCount, contests, entries;

            // TODO: Add results to a new table? Maybe add results link to contests table.
            // TODO: Get count of only this contest's entries.
            return db.query("SELECT COUNT(*) FROM entry", [], res => {
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
                        // TODO: Get only this contest's entries
                        db.query("SELECT * FROM entry", [], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem getting the entries");
                            }
                            entries = res.rows;
                            return response.render("pages/admin", { entryCount, reviewedCount, contests, entries, evaluator_name: request.decodedToken.evaluator_name });
                        });
                    });
                });
            });
        } catch(err) {
            return handleNext(next, 400, err);
        }
    }
    handleNext(next, 401, "Unauthorized");
}

exports.profile = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/profile", { evaluator_name: request.decodedToken.evaluator_name });
    }
    handleNext(next, 400, "Unauthorized");
}

module.exports = exports;
