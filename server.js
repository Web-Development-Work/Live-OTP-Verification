// Load Dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

// Load configuration from .env file
require('dotenv').config();

// Load and initialize MesageBird SDK
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

// Set up and configure the Express framework
var app = express();

// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
    defaultLayout: 'main',

    // Uses multiple partials dirs, templates in "shared/templates/" are shared
    // with the client-side of the app (see below).
    
    // partialsDir: [
    //     'shared/templates/',
    //     'views/partials/'
    //     ]
});

// app.engine('handlebars', exphbs.create({defaultLayout: 'main'}));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended : true }));

// Display page to ask the user for their phone number
app.get('/', function(req, res) {
    res.render('step1');
});


app.post("/step2",function(req,res){
    
    var number = req.body.number;
    
    messagebird.verify.create(number , {
        originator : 'Code',
        template : 'Your verification code is %token.'
    },function(err,response){
        if (err) {
            // Request has failed
            console.log(err);
            res.render('step1', {
                error : err.errors[0].description
            });
        } else {
            // Request was successful
            console.log(response);
            res.render('step2', {
                id : response.id
            });
        }
    })
});

// Verify whether the token is correct
app.post('/step3', function(req, res) {
    
    var id = req.body.id;
    var token = req.body.token;

    // Make request to Verify API
    messagebird.verify.verify(id, token, function(err, response) {
        if (err) {
            // Verification has failed
            console.log(err);
            res.render('step2', {
                error: err.errors[0].description,
                id : id
            });
        } else {
            // Verification was successful
            console.log(response);
            res.render('step3');
        }
    })    
});

const port = process.env.PORT || 4000;
app.listen(port,()=>{
    console.log(`server is listening on port : ${port}`);
})