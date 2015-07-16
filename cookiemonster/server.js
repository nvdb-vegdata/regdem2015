var express = require('express')
, bodyParser = require('body-parser');

var app = express()
, port = process.env.PORT || 8085
, router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


/* Routes
------------------------------------------------------------------------------*/
var status = require('./routes/status');

router.get('/', function (req, res) {
  res.json({ message: 'Running' });
});

router.get('/status', status);

// Path starts with /api
app.use('/api', router);

// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(port);
console.log('Starting server on port ' + port);
