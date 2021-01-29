const express = require('express');
const AdminsRepository = require('../../repository/admins-repository');
const ProductsRepository = require('../../repository/products-repository');
const UserRepository = require('../../repository/user-repository');
const OrdersRepository = require('../../repository/orders-repository');

class AdminRouter {
    constructor(dbConnection) {
        this.conn = dbConnection;
    }

    createRouter() {
        const router = express.Router();
        const AdminSession = require('./admin-session');
        const adminsRepository = new AdminsRepository(this.conn);
        const AdminSessionService = new AdminSession(adminsRepository);

        router.get('*', (req, res, next) => {
            return AdminSessionService.authenticateAdmin(req, res, next);
        });
        router.post('/login', async (req, res) => {
            return await AdminSessionService.handleAdminLogin(req, res);
        });
        router.get('/logout', (req, res) => {
            return AdminSessionService.handleAdminLogout(req, res);
        });

        router.get('/', (req, res) => {
            res.render('admin-page');
        });


        const AdminProducts = require('./admin-products');
        const productsRepository = new ProductsRepository(this.conn);
        const AdminProductsService = new AdminProducts(productsRepository);

        router.get('/products', async (req, res) => {
            await AdminProductsService.showProductsPage(req, res);
        });
        router.get('/products/new', async (req, res) => {
            await AdminProductsService.showNewProductPage(req, res);
        });
        router.post('/products/new', async (req, res) => {
            await AdminProductsService.handleNewProduct(req, res);
        });
        router.get('/products/edit/:productId', async (req, res) => {
            await AdminProductsService.showEditProductPage(req, res);
        });
        router.post('/products/edit/:productId', async (req, res) => {
            await AdminProductsService.handleEditProduct(req, res);
        });
        router.get('/products/delete/:productId', async (req, res) => {
            await AdminProductsService.handleDeleteProduct(req, res);
        });

        const AdminUsers = require('./admin-users');
        const usersRepository = new UserRepository(this.conn);
        const AdminUsersService = new AdminUsers(usersRepository);
        router.get('/users', async (req, res) => {
            await AdminUsersService.showUsersPage(req, res);
        });

        const AdminOrders = require('./admin-orders');
        const ordersRepository = new OrdersRepository(this.conn)
        const AdminOrdersService = new AdminOrders(ordersRepository);
        router.get('/orders', async (req, res) => {
            await AdminOrdersService.showOrdersPage(req, res);
        });

        return router;
    }
}


module.exports = AdminRouter;