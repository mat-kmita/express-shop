const UserSession = require('../../models/user-session');


class CartService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }

    async handleInvalidProduct(req, res, next) {
        if (!req.body.id) {
            return res.end('No id!');
        }

        const idInt = parseInt(req.body.id);

        let product = await this.productsRepository.get(idInt);
        if (product == null) {
            return res.end(`No product!`);
        }

        res.locals.productData = product;
        next();
    }

    updateCart(req, res) {
        const session = new UserSession(req.session);
        const quantity = parseInt(req.body.quantity);

        if(quantity == 0) {
            session.deleteFromCart(parseInt(req.body.id));
        } else {
            session.addToCart(res.locals.productData, quantity);
        }
        req.session.save((err) => {
            return res.redirect('back');
        })
    }

    deleteFromCart(req, res) {
        const session = new UserSession(req.session);

        session.deleteFromCart(parseInt(req.body.id));
        req.session.save((err) => {
            return res.redirect('back');
        })
    }
}

module.exports = CartService;