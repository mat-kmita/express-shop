const UserSession = require('../../models/user-session');
const Validators = require('../../validators');

class CartService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }

    async handleInvalidProduct(req, res, next) {
        if (!req.body.id) {
            return res.end('No id!');
        }

        const idInt = parseInt(req.body.id);
        if(isNaN(idInt)) return res.end('Invalid product Id!');

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

        if(!Validators.validQuantity(quantity)) return res.end('Invalid quantity input! Must be an integer!');

        if(quantity == 0) {
            const idInt = parseInt(req.body.id);
            if(isNaN(idInt)) return res.end('Invalid product id! Must be an integer!');

            session.deleteFromCart(idInt);
        } else {
            session.addToCart(res.locals.productData, quantity);
        }

        req.session.save((err) => {
            return res.redirect('back');
        })
    }

    deleteFromCart(req, res) {
        const session = new UserSession(req.session);

        const idInt = parseInt(req.body.id);
        if(isNaN(idInt)) return res.end('Invalid product id! Must be an integer!');

        session.deleteFromCart(idInt);
        req.session.save((err) => {
            return res.redirect('back');
        })
    }
}

module.exports = CartService;