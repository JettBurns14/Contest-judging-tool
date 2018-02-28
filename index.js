var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//app.set('views', __dirname + '/views');
//app.set('view engine', 'html');

app.get('/contest.js', function(req, res){
    res.send("var CONTEST_ID = '" + process.env.CONTEST_PROGRAM_ID + "'");
});

app.get('/', function(request, response) {
  response.render('pages/judging');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
