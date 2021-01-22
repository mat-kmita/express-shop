const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const bcrypt = require('bcrypt');
const db = require('./db');
const repository = require('./repository')(db.connection);
const validators = require('./validators');

const hashingRounds = 12;

let app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('./static'));
app.use(express.urlencoded({extended:true}));
app.use(session({
    store: new pgSession({
        pgPromise: db.connection,
    }),
    secret: "sekretne_haslo",
    resave: true,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
    return res.render('index');
});

app.get('/login', (req, res, next) => {
    if(req.query.welcome === '1')
        return next();

    if(!req.session.sessionValue)
        return res.render('login');
    else
        return res.redirect('/');
}, (req, res) => {
    if(req.session.sessionValue) {
        let oldValue = req.session.sessionValue;
        req.session.destroy((err) => {
            console.log("destroyed old session with value " + oldValue);
            if(err) {
                console.log("error while destroying session!");
            }
        });
    }

    res.render('login', {
        welcome: true
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    let form = {
        username: req.body.username,
        password: req.body.password,
        passwordRepeated: req.body.passwordRepeated
    };

    let validationResult = validators.validateRegistrationForm(form);
    if(!validationResult.isValid) {
        res.render('register', {
            usernameError: validationResult.usernameError,
            passwordError: validationResult.passwordError,
            passwordRepeatError: validationResult.passwordsEqualError
        });
        return;
    }

    let passwordHash = await bcrypt.hash(req.body.password, hashingRounds);
    let result = await repository.UserRepository.insert({
        username: req.body.username,
        passwordHash: passwordHash
    }); 

    if(!result)
        return res.render('register', {
            usernameTaken: true
        });

    res.redirect('/login?welcome=1');
});
 
app.post('/login', async (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    var user = await repository.UserRepository.get(username);

    if( null === user)
        return res.render('login', {
            invalidInput: true
        });
    else {
        let isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordValid) {
            return res.render('login', {
                invalidInput: true
            });
        }
    }

    if(!req.session.sessionValue) {
        req.session.sessionValue = {
            user: username
        }
    } else {
        res.end("Już jesteś zalogowany!");
        return;
    }

    res.end("Zalogowano!");
});


http.createServer(app).listen(8080);