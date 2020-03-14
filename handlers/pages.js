const {
    handleNext,
    jsonMessage
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat, displayFancyDateFormat } = require(process.cwd() + "/util/variables");

exports.home = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/home", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin
        });
    }
    response.render("pages/home", {
        logged_in: false,
        is_admin: false
    });
}

exports.login = (request, response) => {
    if (request.decodedToken) {
        return response.redirect("/");
    }
    response.render("pages/login", {
        logged_in: false
    });
}

exports.judging = (request, response, next) => {
    if (request.decodedToken) {
        return db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [request.decodedToken.evaluator_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting an entry");
            }
            return response.render("pages/judging", {
                entry: res.rows[0],
                logged_in: true
            });
        });
    }
    // Instead, show the public version with dumby data.
    response.render("pages/judging", {
        logged_in: false,
        entry: {
            o_entry_id: 1316,
            o_entry_url: 'https://www.khanacademy.org/computer-programming/example-entry/6586620957786112',
            o_entry_title: 'Example entry',
            o_entry_height: 400
        }
    });
}

exports.admin = (request, response, next) => {
    if (request.decodedToken) {
        if (request.params.page === "dashboard") {
            return response.render("pages/admin/dashboard", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        } else if (request.params.page === "contests") {
            return response.render("pages/admin/contests", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        } else if (request.params.page === "tasks" && request.decodedToken.is_admin) {
            return response.render("pages/admin/tasks", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        } else if (request.params.page === "users" && request.decodedToken.is_admin) {
            return response.render("pages/admin/users", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        }
        else if (request.params.page === "judging" && request.decodedToken.is_admin) {
            return response.render("pages/admin/judging", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        }
        else {
            return response.render("pages/admin/dashboard", {
                logged_in: true,
                is_admin: request.decodedToken.is_admin
            });
        }
    }
    response.render("pages/admin", {
        logged_in: false,
        is_admin: false
    });
}

exports.results = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/results", {
            logged_in: true,
            is_admin: request.decodedToken.is_admin
        });
    }
    response.render("pages/results", {
        is_admin: false,
        logged_in: false
    });
}

exports.entries = (request, response, next) => {
    if (request.decodedToken) {
        return response.render("pages/entries", {
            logged_in: true,
            contest_id: request.params.contestId,
            is_admin: request.decodedToken.is_admin,
        });
    }
    response.render("pages/entries", {
        is_admin: false,
        logged_in: false
    });
}

module.exports = exports;
