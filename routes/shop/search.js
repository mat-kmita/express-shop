const UserSession = require('../../models/user-session');

class SearchService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }

    async showSearchPage(req, res) {
        let session = new UserSession(req.session);

        let searchQuery = req.query.query? req.query.query: null;

        if(searchQuery == null) {
            return res.render('search', {
                session: session.getModel(),
                query: '',
                products: null
            })
        }

        const productsData = await this.productsRepository.findByName(searchQuery);

        return res.render('search', {
            session: session.getModel(),
            query: searchQuery,
            products: productsData
        });
    }



}

module.exports = SearchService;