const { isLoggedIn, handleNext, jsonMessage } = require("../functions");
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
        let userId = request.cookies[process.env.COOKIE_2];
        db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [userId], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting an entry");
            }
            response.render("pages/judging", { entry: res.rows[0] });
        });
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
                db.query("SELECT * FROM contest", [], res => {
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
    response.render("pages/profile", { username: request.cookies[process.env.COOKIE_3] });
}

module.exports = exports;
