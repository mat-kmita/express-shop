const Pagination = require('../../models/pagination');

class AdminOrdersService {
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
    }

    async showOrdersPage(req, res) {
        let pageInt = req.query.page? parseInt(req.query.page) : 1;
        if(isNaN(pageInt)) return res.end('Invalid page query parameter! Must be an integer!');

        let ordersCount = await this.ordersRepository.getCount();
        let ordersData = await this.ordersRepository.getPage(pageInt, 20);
        let pagination = new Pagination(20, pageInt, ordersCount.count);

        res.render('admin-orders', {
            page: pagination.createModel(),
            orders: ordersData
        });
    }
}

module.exports = AdminOrdersService;