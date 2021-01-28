const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const bcrypt = require('bcrypt');
const db = require('./db');
const repository = require('./repository');
const validators = require('./validators');

const adminRoutes_mod = require('./routes/admin');
const adminRoutes = new adminRoutes_mod(db.connection).createRouter();

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

class ShopModel {
    constructor(session) {
        this.cart = session? session.cart : null;
        this.user = session? session.user: null;
    }

    isAdminSession() {
        return false;
    }

    isUserLoggedIn() {
        return this.user? true: false;
    }

    getModel() {
        return {
            loggedIn: this.isUserLoggedIn(),
            cart: this.cart,
            user: this.user
        }
    }

    logIn(user) {
        return null;
    }

    logOut() {
        // this. = null;
    }
}

app.get(['/orders', '/data'], (req, res, next) => {
    // let sessionWrapper = new ShopModel(req.session.sessionValue);
    if(!req.session.sessionValue) {
        return res.status(401).end('Access denied!');    
    }
    next();
});

app.get(['/orders/:orderId'], async (req, res, next) => {
    if(!req.session.sessionValue) {
        return res.status(403).end('You dont have access to any order!!');
    } else {
        let orderData = await new repository.OrdersRepository(db.connection).get(req.params['orderId']);

        console.log(`ORder data: ${JSON.stringify(orderData)}`);
        if(orderData.user_id != req.session.sessionValue.user.id) {
            return res.status(403).end('It\'s not your order!');
        }
    }
    next();
});

app.get('/', async (req, res) => {

    let sessionWrapper = new ShopModel(req.session.sessionValue);
    console.log(req.session.sessionValue);
    console.log(sessionWrapper.getModel());
    return res.render('index', {
        session: sessionWrapper.getModel()
    });
});

app.get('/login', (req, res, next) => {
    if(req.query.welcome === '1')
        return next();

    if(!req.session.sessionValue)
        return res.render('login', {
            action: '/login'
        });
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
        welcome: true,
        action: '/login'
    });
});

app.post('/login', async (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    var user = await new repository.UserRepository(db.connection).get(username);
    console.log(`User in login: ${user}`);

    if( null === user)
        return res.render('login', {
            invalidInput: true,
            action: '/login'
        });
    else {
        let isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordValid) {
            return res.render('login', {
                invalidInput: true,
                action: '/login'
            });
        }
    }

    if(!req.session.sessionValue) {
        req.session.sessionValue = {
            user: user
        }
    } 
    req.session.save((err) => {
        res.redirect('/');
    });

});

app.get('/register', (req, res) => {
    res.render('register', {
        action: '/register'
    });
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
            passwordRepeatError: validationResult.passwordsEqualError,
            action: '/register'
        });
        return;
    }

    let passwordHash = await bcrypt.hash(req.body.password, hashingRounds);
    let result = await new repository.UserRepository(db.connection).insert({
        username: req.body.username,
        passwordHash: passwordHash
    }); 

    if(!result)
        return res.render('register', {
            usernameTaken: true,
            action: '/register'
        });

    res.redirect('/login?welcome=1');
});

app.get('/data', async (req, res) => {
    let sessionWrapper = new ShopModel(req.session.sessionValue);

    console.log(sessionWrapper.getModel())

    let userData = await new repository.UserRepository(db.connection).get(req.session.sessionValue.user);

    let model = {
        session: sessionWrapper.getModel(),
        address: userData
    }

    console.log(model.address);

    res.render('data', model);
});

app.post('/data', async (req, res) => {
    let newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        street: req.body.street,
        buildingNumber: req.body.buildingNumber,
        flatNumber: req.body.flatNumber,
        city: req.body.city,
        postalCode: req.body.postalCode
    }
    let newUserData = await new repository.UserRepository(db.connection).update(newUser);


    let model = {
        isLoggedIn: req.session.sessionValue? true: false,
        address: newUserData,
        isUpdated: true
    }


    res.render('data', model);
});

function createPaginationModel(pageSize, currentPage, elementsCount) {
    let result = {};
    if(elementsCount == 0) {
        result.empty = true;
    } else {
        result.empty = false;

        if(elementsCount <= pageSize) {
            result.showPreviousButton = false;
            result.showNextButton = false;
        } else {
            const maxPage = Math.ceil(elementsCount / pageSize);
            console.log(`Max page: ${maxPage}`);
            result.showPreviousButton = currentPage != 1;
            result.showNextButton = currentPage != maxPage;
        }
    }

    return result;
}

app.get('/orders', async (req, res) => {
    const PAGE_SIZE = 2;

    let sessionWrapper = new ShopModel(req.session.sessionValue);
    console.log(req.query);
    let currentPage = req.query.page? parseInt(req.query.page): 1;

    console.log(`Page: ${currentPage}`)
    let ordersCountForUser = await new repository.OrdersRepository(db.connection).getCountForUser(sessionWrapper.user.id);
    let ordersData = await new repository.OrdersRepository(db.connection).getPageForUser(sessionWrapper.user.id, parseInt(currentPage), PAGE_SIZE);
    let paginationModel = createPaginationModel(PAGE_SIZE, currentPage, ordersCountForUser.count);

    console.log(`Data: ${ordersData}, page: ${currentPage}`);

    console.log(ordersCountForUser);
    let pageModel = {
        page: currentPage,
        data: ordersData,
    };
    console.log(pageModel.data);
    return res.render('orders', {
        session: sessionWrapper.getModel(),
        model: pageModel,
        paginationModel: paginationModel
    });
});

function createProductsList(data) {
    let result = data.map(v => {
        return {
            id: v['product_id'],
            name: v['name'],
            quantity: v['quantity'],
            singlePrice: v['price'] / 100,
            price: v['price'] * v['quantity'] / 100
        }
    });
    let totalPrice = result.reduce( (acc, v) => {
        return acc + v.price;
    }, 0);

    console.log(`Total price: ${totalPrice}`);

    return {
        products: result,
        totalPrice: totalPrice
    }
}

app.get('/orders/:orderId', async (req, res) => {
    let sessionWrapper = new ShopModel(req.session.sessionValue);

    let orderDetails = await new repository.OrdersProductsRepository(db.connection).getProductsForOrder(req.params['orderId']);

    let data = createProductsList(orderDetails);

    let model = {
        orderId: req.params['orderId'],
        products: data.products,
        totalPrice: data.totalPrice
    }
    console.log(JSON.stringify(data));
    res.render('order-details', {
        model: model,
        session: sessionWrapper.getModel(),
    })
})


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })
})

app.use('/admin', adminRoutes);


async function main() {
    db.initializeDatabase();

    http.createServer(app).listen(8080);
}

main();