/** Handlers for GETTING, ADDING, EDITING, and DELETING contests **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");

exports.get = (request, response, next) => {
    return db.query("SELECT *, to_char(date_start, $1) as date_start, to_char(date_end, $2) as date_end FROM contest ORDER BY contest_id DESC", [displayDateFormat, displayDateFormat], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the contests");
        }
        response.json({
            is_admin: request.decodedToken ? request.decodedToken.is_admin : false,
            contests: res.rows
        });
    });
};

exports.add = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                contest_name,
                contest_url,
                contest_author,
                contest_start_date,
                contest_end_date,
                contest_current
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("INSERT INTO contest (contest_name, contest_url, contest_author, date_start, date_end, current) VALUES ($1, $2, $3, $4, $5, $6)", [contest_name, contest_url, contest_author, contest_start_date, contest_end_date, contest_current], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this contest");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.edit = (request, response, next) => {
    if (request.decodedToken) {
        try {
            if (request.decodedToken.is_admin) {
                let {
                    edit_contest_id,
                    edit_contest_name,
                    edit_contest_url,
                    edit_contest_author,
                    edit_contest_start_date,
                    edit_contest_end_date,
                    edit_contest_current
                } = request.body;
                let values = [edit_contest_name, edit_contest_url, edit_contest_author, edit_contest_start_date, edit_contest_end_date, edit_contest_current, edit_contest_id];
                return db.query("UPDATE contest SET contest_name = $1, contest_url = $2, contest_author = $3, date_start = $4, date_end = $5, current = $6 WHERE contest_id = $7", values, res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this contest");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.delete = (request, response, next) => {
    if (request.decodedToken) {
        try {
            if (request.decodedToken.is_admin) {
                let {
                    contest_id
                } = request.body;
                return db.query("DELETE FROM contest WHERE contest_id = $1", [contest_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this contest");
                    };
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this contest");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

module.exports = exports;