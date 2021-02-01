const UserSession = require('../../models/user-session');
const CartModel = require('../../models/cart-model');

class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }

    async handleInvalidProduct(req, res, next) {
        const productData = await this.productsRepository.get(req.params.productId);

        if(productData == null) {
            return res.status(404).render('product-not-found');
        }

        res.locals.productData = productData;
        next();
    }

    async showProductPage(req, res) {
        console.log('Will shoe product!~');
        let session = new UserSession(req.session);
        const productData = res.locals.productData;

        let model = {
            session: session.getModel(),
            product: productData,
        };


        if(session.isUserLoggedIn()) {
            let cart = session.cartModel;
            let productInCart = cart.getProductFromCart(req.params.productId);
            model.cartQuantity = productInCart == null? 0 : productInCart.quantity;
        }

        return res.render('product', model);

    }
}

module.exports = ProductsService;