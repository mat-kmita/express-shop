const express = require('express');
const router = express.Router();
const repository = require('../../repository');

class AdminRouter {
    constructor(dbConnection) {
        this.conn = dbConnection;
    }

    createRouter() {
        const AdminSession = require('./admin-session');
        const AdminsRepository = new repository.AdminsRepository(this.conn);
        const AdminSessionService = new AdminSession(AdminsRepository);

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
        let ProductsRepository = new repository.ProductsRepository(this.conn);
        const AdminProductsService = new AdminProducts(ProductsRepository);

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
        const UsersRepository = new repository.UserRepository(this.conn);
        const AdminUsersService = new AdminUsers(UsersRepository);
        router.get('/users', async (req, res) => {
            await AdminUsersService.showUsersPage(req, res);
        });

        const AdminOrders = require('./admin-orders');
        const OrdersRepository = new repository.OrdersRepository(this.conn)
        const AdminOrdersService = new AdminOrders(OrdersRepository);
        router.get('/orders', async (req, res) => {
            await AdminOrdersService.showOrdersPage(req, res);
        });

        return router;
    }
}


module.exports = AdminRouter;