const express = require('express');
const bodyParser = require('body-parser');
const Request = require('request');
const Moment = require('moment');
const CookieParser = require('cookie-parser');
const pg = require('pg');

const app = express();

// views is directory for all template files
// app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.use(CookieParser());
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});

// Ref: https://github.com/expressjs/body-parser
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Specifies where pages are, and what format.
// app.set('views', __dirname + '/views');
// app.set('view engine', 'html');

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

/***  POST ROUTES  ***/

app.post('/routes/judging', urlencodedParser, (request, response) => {
    console.log('/routes/judging was fired.');
    if (!request.body) {
        return handleError({ error: 'No request body received.' }, response);
    }

    let entry_id = request.body.entry_id;
    let user_id = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    let score_1 = request.body.creativity / 2;
    let score_2 = request.body.complexity / 2;
    let score_3 = request.body.quality_code / 2;
    let score_4 = request.body.interpretation / 2;
    let skill_level = request.body.skill_level;

    try {
        pg.connect(process.env.DATABASE_URL, (err, client, done) => {
            client.query('SELECT evaluate($1, $2, $3, $4, $5, $6, $7)', [entry_id, user_id, score_1, score_2, score_3, score_4, skill_level], (err, result) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                response.redirect('/judging');
            });
        });
    } catch(err) {
        handleError(err, response);
    }
});

// WIP
app.post('/routes/update-entries', (request, response) => {
    console.log('/routes/update-entries was fired.');
    // https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:5234130249875456/top-forks?sort=2&page=0&limit=1000&format=pretty
    Request(`https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:${process.env.CONTEST_PROGRAM_ID}/top-forks?sort=2&page=0&limit=1000`, (err, res, body) => {
        console.log('Request callback called.');
        if (!JSON.parse(body)) {
            return handleError({ error: 'No request body received.' }, response);
        } else
        if (err) {
            return handleError(err, response);
        }

        let data = JSON.parse(body);
        if (data) {
            console.log('Data exists.');
            // When data is received (which is sorted already)...
            // SELECT all current entries in DB table.
            // Sort current table entries by created date.
            // Get most recent entry from table, TOP().
            try {
                pg.connect(process.env.DATABASE_URL, (err, client, done) => {
                    client.query('SELECT MAX(entry_created) FROM entry', (err, res) => {
                        done();
                        console.log('Query callback called.');
                        if (err) {
                            return handleError(err, response);
                        }
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
                });
            } catch(err) {
                handleError(err, response);
            }
            // Now compare most recent table entry creation date to all dates in API entries.
            // If programs have been created since the most recent in table, store them.
            // Once all have been compared, INSERT stored entries into table.
        }
    });
});

app.post('/routes/login', urlencodedParser, (request, response) => {
    console.log('/routes/login was fired.');

    if (!JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_1]) {

        if (request.body.councilPassword === process.env.COUNCIL_PW) {
            let userId = request.body.evaluator.split(' - ')[0];
            let username = request.body.evaluator.split(' - ')[1];
            let password = request.body.userPassword;

            pg.connect(process.env.DATABASE_URL, (err, client, done) => {
                client.query('SELECT verify_evaluator($1, $2)', [userId, password], (err, res) => {
                    done();
                    if (err) {
                        return handleError(err, response);
                    }
                    if (res.rows[0].verify_evaluator) {
                        response.cookie(process.env.COOKIE_1, true, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        response.cookie(process.env.COOKIE_2, userId, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});
                        response.cookie(process.env.COOKIE_3, username, { expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))});

                        client.query('UPDATE evaluator SET logged_in = true WHERE evaluator_id = $1', [userId], (err, res) => {
                            if (err) {
                                return handleError(err, response);
                            }
                            response.redirect('/');
                        });
                    } else {
                        response.send('Account password is incorrect.');
                    }
                });
            });
        } else {
            response.send('Council password is incorrect.');
        }
    } else {
        response.redirect('/');
    }
});

app.post('/routes/log-out', urlencodedParser, (request, response) => {
    console.log('/routes/log-out was fired.');

    let userId = JSON.parse(JSON.stringify(request.cookies))[process.env.COOKIE_2];
    console.log(userId);

    pg.connect(process.env.DATABASE_URL, (err, client, done) => {
        console.log('Connected to db.')
        client.query('UPDATE evaluator SET logged_in = false WHERE evaluator_id = $1', [userId], (err, res) => {
            done();
            console.log('Updated db.')
            if (err) {
                return handleError(err, response);
            }
            response.clearCookie(process.env.COOKIE_1);
            response.clearCookie(process.env.COOKIE_2);
            response.clearCookie(process.env.COOKIE_3);
            response.redirect('/login');
        });
    });
});

/***  PAGE ROUTES  ***/
app.get('/', (request, response) => {
    if (!checkAccess(request)) {
        response.send('Unauthorized');
    } else {
        response.render('pages/home');
    }
});

app.get('/login', (request, response) => {
    if (!checkAccess(request)) {
        return response.redirect('/');
    }
    try {
        response.render('pages/login');
    } catch(err) {
        handleError(err, response);
    }
});

app.get('/judging', (request, response) => {
    if (!checkAccess(request)) {
        return response.send('Unauthorized');
    }
    try {
        let userId = request.cookies[process.env.COOKIE_2];
        pg.connect(process.env.DATABASE_URL, (err, client, done) => {
            client.query(`SELECT * FROM get_entry_and_create_placeholder($1)`, [userId], (err, res) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                response.render('pages/judging', { entry: res.rows[0] });
            });
        });
    } catch(err) {
        handleError(err, response);
    }
});

app.get('/admin', (request, response) => {
    if (!checkAccess(request)) {
        return response.send('Unauthorized');
    }
    try {
        pg.connect(process.env.DATABASE_URL, (err, client, done) => {
            var entry1, reviewed1, contests1, entries1;

            // TODO: Add results to a new table? Maybe add results link to contests table.
            // TODO: Get count of only this contest's entries.
            client.query('SELECT COUNT(*) FROM entry', (err, res) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                entry1 = res.rows;
            });
            // TODO: Get count of only this contest's evals.
            client.query('SELECT COUNT(*) FROM evaluation WHERE evaluation_complete = true;', (err, res) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                reviewed1 = res.rows;
            });
            client.query('SELECT * FROM contest', (err, res) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                contests1 = res.rows;
            });
            // TODO: Get only this contest's entries
            client.query('SELECT * FROM entry', (err, res) => {
                done();
                if (err) {
                    return handleError(err, response);
                }
                entries1 = res.rows;
                response.render('pages/admin', { entry1: entry1, reviewed1: reviewed1, contests1: contests1, entries1: entries1 });
            });
        });
    } catch(err) {
        handleError(err, response);
    }
});

app.get('/profile', (request, response) => {
    if (!checkAccess(request)) {
        return response.send('Unauthorized');
    }
    response.render('pages/profile', { username: request.cookies[process.env.COOKIE_3] });
});

// Handler for all errors.
app.use(function(err, req, res, next) {
    handleError(err, res);
});
