const { isLoggedIn, handleNext, jsonMessage, getJWTToken } = require("../functions");
const db = require("../db");

exports.home = (request, response, next) => {
    if (!isLoggedIn(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    response.render("pages/home");
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
        let entryCount, reviewedCount, contests, entries;

        // TODO: Add results to a new table? Maybe add results link to contests table.
        // TODO: Get count of only this contest's entries.
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
                    // TODO: Get only this contest's entries
                    db.query("SELECT * FROM entry", [], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem getting the entries");
                        }
                        entries = res.rows;
                        response.render("pages/admin", { entryCount, reviewedCount, contests, entries });
                    });
                });
            });
        });
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

module.exports = exports;
