require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const Request = require('request');
const Moment = require('moment');
const CookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const db = require("./db");
const errorHandler = require("./handlers/error");

const app = express();

app.set('view engine', 'ejs');

app.use(CookieParser());
app.use(express.static(__dirname + '/public'));

// Ref: https://github.com/expressjs/body-parser
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Error handler function.
function handleError(err, res) {
    console.error(err);
    res.status(500).render('pages/error', { error: err });
};

// Security check.
function checkAccess(req) {
    if (JSON.parse(JSON.stringify(req.cookies))[process.env.COOKIE_1]) {
      return true;
    }
    return false;
}

// Respond with JSON message.
function jsonMessage(res, code, msg) {
    return res.json({ code: code, message: msg });
}

function handleNext(next, status, message) {
    return next({
        status,
        message
    });
}

/***  POST ROUTES  ***/

app.post('/routes/judging', urlencodedParser, (request, response) => {
    console.log('/routes/judging was fired.');
    if (!request.body) {
        return handleNext(next, 400, "No request body received");
    }

    let entry_id = request.body.entry_id;
    let user_id = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    let score_1 = request.body.creativity / 2;
    let score_2 = request.body.complexity / 2;
    let score_3 = request.body.quality_code / 2;
    let score_4 = request.body.interpretation / 2;
    let skill_level = request.body.skill_level;

    try {
        db.query('SELECT evaluate($1, $2, $3, $4, $5, $6, $7)', [entry_id, user_id, score_1, score_2, score_3, score_4, skill_level], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem evaluating this entry");
            }
            response.redirect('/judging');
        });
    } catch(err) {
        return handleNext(next, 400, "There was a problem evaluating this entry");
    }
});

// WIP, could be used to load all entries into Db once contest is over.
app.post('/routes/update-entries', (request, response, next) => {
    console.log('/routes/update-entries was fired.');

    Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${process.env.CONTEST_PROGRAM_ID}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
        console.log('Request callback called.');
        if (!JSON.parse(body)) {
            return handleNext(next, 400, "No request body received");
        } else
        if (err) {
            return handleNext(next, 400, "There was a problem with the request");
        }

        let data = JSON.parse(body);
        if (data) {
            console.log('Data exists.');
            // When data is received (which is sorted already)...
            // SELECT all current entries in DB table.
            // Sort current table entries by created date.
            // Get most recent entry from table, TOP().
            try {
                db.query('SELECT MAX(entry_created) FROM entry', [], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem getting the most recent entry");
                    }
                    console.log('Query callback called.');
                    // Handle error
                    console.log(`${res.rows[0].max} --- ${data.scratchpads.length} new programs.`);
                    for (var i = 0; i < data.scratchpads.length; ++i) {
                        // moment docs: http://momentjs.com/docs/#/query/
                        if (Moment(res.rows[0].max).isBefore(data.scratchpads[i].created)) {
                            //console.log(`Program ${data.scratchpads[i].title} was created after ${res.rows[0].max} on ${data.scratchpads[i].created}.`);
                            console.log(`${data.scratchpads[i].created} - ${data.scratchpads[i].url}`)
                        }
                        // console.log(`Program "${data.scratchpads[i].title}" created on ${data.scratchpads[i].created}. ${Moment(res.rows[0].max).isBefore(data.scratchpads[i].created)}`);
                    }
                    // Store all API entries created after this returned date.
                    // Loop through entries, and check if each moment(res.row).isBefore(data[i].created)
                });
            } catch(err) {
                return handleNext(next, 400, "There was a problem logging the entry data");
            }
            // Now compare most recent table entry creation date to all dates in API entries.
            // If programs have been created since the most recent in table, store them.
            // Once all have been compared, INSERT stored entries into table.
        } else {
            return handleNext(next, 400, "There is no parsed JSON data");
        }
    });
});

app.post('/routes/login', jsonParser, (request, response, next) => {
    console.log('/routes/login was fired.');

    // If requester has no cookie, proceed with logging in, otherwise say they are logged in.
    if (!checkAccess(request)) {
        if (request.body.councilPassword === process.env.COUNCIL_PW) {
            let userId = request.body.evaluator;
            // let username = request.body.evaluator.split(' - ')[1];
            let password = request.body.userPassword;
            // Needs to use a username, not id.
            db.query('SELECT verify_evaluator($1, $2)', [userId, password], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem logging you in");
                }
                if (res.rows[0].verify_evaluator) {
                    db.query('UPDATE evaluator SET logged_in = true WHERE evaluator_id = $1', [userId], res => {
                        if (res.error) {
                            return handleNext(next, 400, "There was a problem logging you in");
                        }
                        response.cookie(process.env.COOKIE_1, true, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        response.cookie(process.env.COOKIE_2, userId, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        // response.cookie(process.env.COOKIE_3, username, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        jsonMessage(response, 4, "Welcome!");
                    });
                } else {
                    return handleNext(next, 401, "Account password is incorrect");
                    // jsonMessage(response, 3, "Account password is incorrect");
                }
            });
        } else {
            return handleNext(next, 401, "Council password is incorrect");
            // jsonMessage(response, 2, "Council password is incorrect");
        }
    } else {
        return handleNext(next, 400, "You are already logged in");
        // jsonMessage(response, 1, "Unauthorized");
    }
});

app.post('/routes/log-out', urlencodedParser, (request, response, next) => {
    console.log('/routes/log-out was fired.');

    let userId = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    console.log(userId);

    db.query('UPDATE evaluator SET logged_in = false WHERE evaluator_id = $1', [userId], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem logging you out");
        }
        response.clearCookie(process.env.COOKIE_1);
        response.clearCookie(process.env.COOKIE_2);
        response.clearCookie(process.env.COOKIE_3);
        response.redirect('/login');
    });
});

/***  PAGE ROUTES  ***/
app.get('/', (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    response.render('pages/home');
});

app.get('/login', (request, response) => {
    if (checkAccess(request)) {
        return response.redirect('/');
    }
    response.render('pages/login');
});

app.get('/judging', (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
        let userId = request.cookies[process.env.COOKIE_2];
        db.query("SELECT * FROM get_entry_and_create_placeholder($1)", [userId], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting an entry");
            }
            response.render('pages/judging', { entry: res.rows[0] });
        });
    } catch(err) {
        return handleNext(next, 400, err);
    }
});

app.get('/admin', (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 401, "Unauthorized");
    }
    try {
        let entry1, reviewed1, contests1, entries1;

        // TODO: Add results to a new table? Maybe add results link to contests table.
        // TODO: Get count of only this contest's entries.
        db.query('SELECT COUNT(*) FROM entry', [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the number of entries");
            }
            entry1 = res.rows;
        });
        // TODO: Get count of only this contest's evals.
        db.query('SELECT COUNT(*) FROM evaluation WHERE evaluation_complete = true;', [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the evaluations");
            }
            reviewed1 = res.rows;
        });
        db.query('SELECT * FROM contest', [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the contests");
            }
            contests1 = res.rows;
        });
        // TODO: Get only this contest's entries
        db.query('SELECT * FROM entry', [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the entries");
            }
            entries1 = res.rows;
            response.render('pages/admin', { entry1: entry1, reviewed1: reviewed1, contests1: contests1, entries1: entries1 });
        });
    } catch(err) {
        return handleNext(next, 400, err);
    }
});

app.get('/profile', (request, response, next) => {
    if (!checkAccess(request)) {
        return handleNext(next, 400, "Unauthorized");
    }
    response.render('pages/profile', { username: request.cookies[process.env.COOKIE_3] });
});

// Handler for any undefined routes.
app.use(function(req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Handler for standardizing error format.
app.use(errorHandler);

db.connect(
    db.MODE_DEV,
    () => {
        console.log("Connected to Postgres");
        app.listen(PORT, () => {
            console.log(`Council app is running on port ${PORT}, http://localhost:${PORT}/`);
        });
    }
);
