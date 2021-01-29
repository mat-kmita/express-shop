const Pagination = require('./pagination');
const UserSession = require('./user-session');

class OrdersService {

    constructor(ordersRepository, ordersProductsRepository) {
        this.ordersRepository = ordersRepository;
        this.ordersProductsRepository = ordersProductsRepository;
        this.pageLength = 5;
    }

    async showOrdersListPage(req, res) {
        let currentPageInt = req.query.page ? parseInt(req.query.page) : 1;
        let session = new UserSession(req.session);

        let ordersCount = await this.ordersRepository.getCountForUser(session.getUserId());

        let pagination = new Pagination(this.pageLength, currentPageInt, ordersCount.count);

        console.log('Will get orders!');
        console.log(`User id: ${session.getUserId()}, page: ${pagination.currentPage}, page length: ${pagination.pageLength}`)
        let ordersData = await this.ordersRepository.getPageForUser(session.getUserId(), pagination.currentPage, pagination.pageLength);
        let paginationModel = pagination.createModel();

        return res.render('orders', {
            session: session.getModel(),
            orders: ordersData,
            page: paginationModel
        });
    }

    async handleUnathorizedAccessToOrder(req, res, next) {
        const orderIdInt = parseInt(req.params.orderId);
        let orderData = await this.ordersRepository.get(orderIdInt);

        let session = new UserSession(req.session);
        if(orderData == null || orderData.user_id != session.getUserId()) {
            return res.status(403).end('You don\'t have parmission to access this order\'s data');
        }

        next();
    }

    async showOrderDetailsPage(req, res) {
        let session = new UserSession(req.session);
        let orderIdInt = parseInt(req.params.orderId);

        let products = await this.ordersProductsRepository.getProductsForOrder(orderIdInt);

        res.render('order-details', {
            orderId: orderIdInt,
            products: products,
            totalPrice: products.reduce((acc, v) => { return acc+(v.price * v.quantity); }, 0),
            session: session.getModel()
        });
    }
}

module.exports = OrdersService;