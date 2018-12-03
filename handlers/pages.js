const { checkAccess, handleNext, jsonMessage } = require("../functions");
const db = require("../db");

exports.home = (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    response.render("pages/home");
}

exports.login = (request, response) => {
    if (checkAccess(request)) {
        return response.redirect("/");
    }
    response.render("pages/login");
}

exports.judging = (request, response, next) => {
    if (!checkAccess(request)) {
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
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
        let entry1, reviewed1, contests1, entries1;

        // TODO: Add results to a new table? Maybe add results link to contests table.
        // TODO: Get count of only this contest's entries.
        db.query("SELECT COUNT(*) FROM entry", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the number of entries");
            }
            entry1 = res.rows;
        });
        // TODO: Get count of only this contest's evals.
        db.query("SELECT COUNT(*) FROM evaluation WHERE evaluation_complete = true;", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the evaluations");
            }
            reviewed1 = res.rows;
        });
        db.query("SELECT * FROM contest", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the contests");
            }
            contests1 = res.rows;
        });
        // TODO: Get only this contest's entries
        db.query("SELECT * FROM entry", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the entries");
            }
            entries1 = res.rows;
            response.render("pages/admin", { entry1: entry1, reviewed1: reviewed1, contests1: contests1, entries1: entries1 });
        });
    } catch(err) {
        return handleNext(next, 400, err);
    }
}

exports.profile = (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 400, "Unauthorized");
    }
    response.render("pages/profile", { username: request.cookies[process.env.COOKIE_3] });
}

module.exports = exports;
