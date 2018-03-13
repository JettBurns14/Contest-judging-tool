var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Needed?
//app.set('views', __dirname + '/views');
//app.set('view engine', 'html');

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});

/*app.get('/', function(request, response) {
    Home page for user, maybe info/instructions about tool.
});*/

// Body parser stuff
// Ref: https://github.com/expressjs/body-parser
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Post routes
app.get('/routes/contest-id', (request, response) => {
    response.send(`var CONTEST_ID = "${process.env.CONTEST_PROGRAM_ID}"`);
});

app.post('/routes/judging', urlencodedParser, (request, response) => {
    if (!request.body) return response.sendStatus(400);
    console.log('Request received');

    // Try INSERTing the data.
    var creativity_score = request.body.creativity;
    var complexity_score = request.body.complexity;
    var clean_code_score = request.body.clean_code;
    var originality_score = request.body.originality;

    try {
        /*pg.connect(process.env.DATABASE_URL, (err, client, done) => {
            client.query('INSERT INTO ', (err, result) => {
                done();
                if (err) {
                    console.error(err);
                    response.render('pages/error.html', { error: err });
                } else {
                    response.render('pages/dashboard.html', {results: result.rows} );
                }
            });
        });*/
    } catch(err) {
        console.error(err);
        response.render('pages/error.html', { error: err });
    }


    // SQL has callback, just render judging.html with that.
    setTimeout(() => {
        response.render('pages/judging');
    }, 2000);
});

app.post('/routes/update-entries', (request, response) => {
    // Update entries table.
    response.redirect('/judging');
});


// Page routes
app.get('/judging', (request, response) => {
    response.render('pages/judging');
});

app.get('/admin', (request, response) => {
    // this pg.connect could be client.connect()
    // https://node-postgres.com/features/connecting
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        try {
            client.query('SELECT * FROM test_table', function(err, result) {
                done();
                if (err) {
                    console.error(err);
                    response.render('pages/error.html', { error: err });
                } else {
                    response.render('pages/admin', { results: result.rows });
                }
            });
        } catch(err) {
            console.error(err);
            response.render('pages/error.html', { error: err });
        }
    });
});

app.get('/profile', (request, response) => {
    response.render('pages/profile');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
