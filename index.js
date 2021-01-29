const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const bcrypt = require('bcrypt');
const db = require('./db');
// const repository = require('./repository');
const validators = require('./validators');
const UserRepository = require('./repository/user-repository');

const AdminRoutes = require('./routes/admin');
const adminRoutes = new AdminRoutes(db.connection).createRouter();

const ShopRoutes = require('./routes/shop');
const shopRoutes = new ShopRoutes(db.connection).createRouter();

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
    resave: false,
    saveUninitialized: false,
}));


// app.get('/', async (req, res) => {

//     let sessionWrapper = new ShopModel(req.session.sessionValue);
//     console.log(req.session.sessionValue);
//     console.log(sessionWrapper.getModel());
//     return res.render('index', {
//         session: sessionWrapper.getModel()
//     });
// });



app.get('/register', (req, res) => {
    res.render('register', {
        action: '/register'
    });
});

// app.post('/register', async (req, res) => {
//     let form = {
//         username: req.body.username,
//         password: req.body.password,
//         passwordRepeated: req.body.passwordRepeated
//     };

//     let validationResult = validators.validateRegistrationForm(form);
//     if(!validationResult.isValid) {
//         res.render('register', {
//             usernameError: validationResult.usernameError,
//             passwordError: validationResult.passwordError,
//             passwordRepeatError: validationResult.passwordsEqualError,
//             action: '/register'
//         });
//         return;
//     }

//     let passwordHash = await bcrypt.hash(req.body.password, hashingRounds);
//     let result = await new repository.UserRepository(db.connection).insert({
//         username: req.body.username,
//         passwordHash: passwordHash
//     }); 

//     if(!result)
//         return res.render('register', {
//             usernameTaken: true,
//             action: '/register'
//         });

//     res.redirect('/login?welcome=1');
// });


// function createProductsList(data) {
//     let result = data.map(v => {
//         return {
//             id: v['product_id'],
//             name: v['name'],
//             quantity: v['quantity'],
//             singlePrice: v['price'] / 100,
//             price: v['price'] * v['quantity'] / 100
//         }
//     });
//     let totalPrice = result.reduce( (acc, v) => {
//         return acc + v.price;
//     }, 0);

//     console.log(`Total price: ${totalPrice}`);

//     return {
//         products: result,
//         totalPrice: totalPrice
//     }
// }





app.use('/admin', adminRoutes);
app.use('/', shopRoutes);


async function main() {
    db.initializeDatabase();

    http.createServer(app).listen(8080);
}

main();