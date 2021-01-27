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

let globalCategories = [];

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
        let orderData = await repository.OrdersRepository.get(req.params['orderId']);

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
        session: sessionWrapper.getModel(),
        categories: globalCategories
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

    var user = await repository.UserRepository.get(username);
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
    let result = await repository.UserRepository.insert({
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

    let userData = await repository.UserRepository.get(req.session.sessionValue.user);

    let model = {
        session: sessionWrapper.getModel(),
        categories: globalCategories,
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
    let newUserData = await repository.UserRepository.update(newUser);


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
    let ordersCountForUser = await repository.OrdersRepository.getCountForUser(sessionWrapper.user.id);
    let ordersData = await repository.OrdersRepository.getPageForUser(sessionWrapper.user.id, parseInt(currentPage), PAGE_SIZE);
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
        categories: globalCategories,
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

    let orderDetails = await repository.OrdersProductsRepository.getProductsForOrder(req.params['orderId']);

    let data = createProductsList(orderDetails);

    let model = {
        orderId: req.params['orderId'],
        products: data.products,
        totalPrice: data.totalPrice
    }
    console.log(JSON.stringify(data));
    res.render('order-details', {
        model: model,
        categories: globalCategories,
        session: sessionWrapper.getModel(),
    })
})


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })
})


app.get(['/admin', '/admin/*'], (req, res, next) => {
    if(!req.session.adminSession) {
        return res.render('login', {
            action: '/admin/login'
        });
    }

    next();
});

app.post('/admin/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    var user = await repository.AdminsRepository.get(username);
    console.log(`User in login: ${user}`);

    if( null === user)
        return res.render('login', {
            invalidInput: true,
            action: '/admin/login'
        });
    else {
        let isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordValid) {
            return res.render('login', {
                invalidInput: true,
                action: '/admin/login'
            });
        }
    }

    if(!req.session.adminSession) {
        req.session.adminSession = {
            user: user
        }
    } 
    req.session.save((err) => {
        res.redirect('/admin');
    });
})

app.get('/admin', async (req, res) => {
    res.render('admin-page');
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        return res.redirect('/admin');
    });
});

app.get('/admin/products', async (req, res) => {
    let pageInt = (!req.query.page)? 1: parseInt(req.query.page);

    let productsCount = await repository.ProductsRepository.getCountOfProducts();
    let productsData = await repository.ProductsRepository.getPage(pageInt, 10);

    return res.render('admin-products', {
        paginationModel: createPaginationModel(10, pageInt, productsCount.count),
        model: {
            data: productsData,
            page: pageInt
        }
    });
})

app.get('/admin/products/new', async (req, res) => {
    res.render('admin-new-product', {
        product: {}
    });
});

app.post('/admin/products/new', async (req, res) => {
    let newProduct = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price) * 100
    }

    // if(!validateProduct(newProduct)) {
    //     return res.end('Invalid input!');
    // }

    let result = await repository.ProductsRepository.insert(newProduct);

    if(result == null) {
    }

    res.end('addedd new product!');
});

app.get('/admin/products/edit/:productId', async (req, res, next) => {
    let productId = parseInt(req.params.productId);
    let productData = await repository.ProductsRepository.get(productId);

    if(productData == null) return next();

    let editedProduct = {
        name: productData.name,
        description: productData.description,
        price: productData.price / 100
    };

    res.render('admin-edit-product', {
        product: editedProduct
    });
}, (req, res) => {
    res.end('Invalid id!');
});

app.post('/admin/products/edit/:productId', async (req, res) => {
    let productId = parseInt(req.params.productId);
    let editedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price) * 100
    }
    let result = await repository.ProductsRepository.update(productId, editedProduct);

    if(result == null) {
        return res.end('Something wrong!');
    }

    res.end('finished editing!');
});

app.get('/admin/products/delete/:productId', async (req, res) => {
    let productIdInt = parseInt(req.params.productId);
    let result = await repository.ProductsRepository.delete(productIdInt);

    res.end('deleted');

});

app.get('/admin/users', async (req, res) => {
    let pageInt = req.query.page? parseInt(req.query.page): 1;

    console.log(pageInt);
    let usersCount = await repository.UserRepository.getCountOfUsers();
    let usersData = await repository.UserRepository.getPage(pageInt, 20);
    let paginationModel = createPaginationModel(20, pageInt, usersCount.count);

    res.render('admin-users', {
        paginationModel: paginationModel,
        model: {
            page: pageInt,
            data: usersData
        }
    })
});

app.get('/admin/orders', async (req, res) => {
    let pageInt = req.query.page? parseInt(req.query.page): 1;

    console.log(pageInt);
    let ordersCount = await repository.OrdersRepository.getCount();
    let ordersData = await repository.OrdersRepository.getPage(pageInt, 20);
    let paginationModel = createPaginationModel(20, pageInt, ordersCount.count);

    res.render('admin-orders', {
        paginationModel: paginationModel,
        model: {
            page: pageInt,
            data: ordersData
        }
    });
});
// app.get()


async function main() {
    db.initializeDatabase();
    globalCategories = await repository.CategoriesRepository.getAll();

    http.createServer(app).listen(8080);
}

main();