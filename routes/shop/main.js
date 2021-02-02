const UserSession = require('../../models/user-session');
const Pagination = require('../../models/pagination');

class MainService {
    constructor(productsRepostiory) {
        this.productsRepostiory = productsRepostiory;
    }

    async showMainPage(req, res) {
        const pageLength = 9;
        const pageInt = req.query.page? parseInt(req.query.page) : 1;
        if(isNaN(pageInt)) pageInt = 1;

        let session = new UserSession(req.session);

        const countData = await this.productsRepostiory.getCountOfProducts();
        const data = await this.productsRepostiory.getPage(pageInt, pageLength);

        const pagination = new Pagination(pageLength, pageInt, countData.count);

        return res.render('index', {
            session: session.getModel(),
            page: pagination.createModel(),
            products: data
        });
    }
}

module.exports = MainService;