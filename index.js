const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const db = require('./db');

const AdminRoutes = require('./routes/admin');
const ShopRoutes = require('./routes/shop');


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


const adminRoutes = new AdminRoutes(db.connection).createRouter();
const shopRoutes = new ShopRoutes(db.connection).createRouter();
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);


async function main() {
    db.initializeDatabase();

    http.createServer(app).listen(8080);
}

main();