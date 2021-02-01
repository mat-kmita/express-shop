const express = require('express');
const RestrictedAccessService = require('./restricted');
const OrdersService = require('./orders');
const LoginService = require('./login');
const RegistrationService = require('./registration');
const ProductsService = require('./products');
const CartService = require('./cart');
const OrdersRepository = require('../../repository/orders-repository');
const OrdersProductsRepository = require('../../repository/orders-products-repository'); 
const UserRepository = require('../../repository/user-repository');
const ProductsRepository = require('../../repository/products-repository');

class ShopRouter {
    constructor(dbConnection) {
        this.conn = dbConnection;
    }

    createRouter() {
        const expressRouter = express.Router();

        const restrictedAccessService = new RestrictedAccessService();
        const restrictedPaths = ['/orders', '/orders/:id', '/cart', '/cart/*', '/order'];
        expressRouter.all(restrictedPaths, (req, res, next) => {
            restrictedAccessService.allowLoggedIn('unauthorized', 'user')(req, res, next);
        });

        const ordersService = new OrdersService(new OrdersRepository(this.conn), new OrdersProductsRepository(this.conn));
        expressRouter.get('/orders', async (req, res) => {
            await ordersService.showOrdersListPage(req, res);
        })

        expressRouter.get('/orders/:orderId', async (req, res, next) => {
            ordersService.handleUnathorizedAccessToOrder(req, res, next);
        }, async (req, res) => {
            await ordersService.showOrderDetailsPage(req, res);
        })

        const loginService = new LoginService(new UserRepository(this.conn));
        expressRouter.get('/login', (req, res, next) => {
            loginService.handleAlreadyLoggedIn(req, res, next);
        }, (req, res) => {
            loginService.showLoginPage(req, res);
        })
        expressRouter.post('/login', async (req, res) => {
            await loginService.handleLogin(req, res);
        })
        expressRouter.get('/logout', (req, res) => {
            loginService.handleLogout(req, res);
        })

        const registrationService = new RegistrationService(12, new UserRepository(this.conn));
        expressRouter.get('/register', (req, res) => {
            registrationService.showRegistrationPage(req, res);
        });
        expressRouter.post('/register', async (req, res) => {
            await registrationService.handleRegistration(req, res);
        })

        const productsService = new ProductsService(new ProductsRepository(this.conn));
        expressRouter.get('/products/:productId', 
        async (req, res, next) => {
            await productsService.handleInvalidProduct(req, res, next);
        }, 
        async (req, res) => {
            await productsService.showProductPage(req, res);
        })

        const cartService = new CartService(new ProductsRepository(this.conn));
        expressRouter.post('/cart/add', async (req, res, next) => {
            await cartService.handleInvalidProduct(req, res, next);
        },  async (req, res) => {
            await cartService.updateCart(req, res);
        });

        expressRouter.post('/cart/delete', async (req, res, next) => {
            await cartService.handleInvalidProduct(req, res, next);
        },  async (req, res) => {
            await cartService.deleteFromCart(req, res);
        });

        return expressRouter;
    }
}

module.exports = ShopRouter;