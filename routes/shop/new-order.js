const UserSession = require('../../models/user-session');

class Order {
    constructor(productsRepository, ordersRepository) {
        this.productsRepository = productsRepository;
        this.ordersRepository = ordersRepository;
    }

    async validateCart(req, res, next) {
        let session = new UserSession(req.session);
        
        let validProductsArray = [];
        let modifiedProductsArray = [];
        let removedProductsArray = [];

        for(const product of session.getCart()) {
            let productData = await this.productsRepository.get(product.id);

            if(productData == null) {
                removedProductsArray.push(product);
            } else if(product.price != productData.price || product.name != productData.name) {
                modifiedProductsArray.push({
                    inCart: product,
                    inDb: productData
                });
            } else {
                validProductsArray.push(product);
            }
        }

        for(let removedProduct of removedProductsArray) {
            session.deleteFromCart(removedProduct.id);
        }

        for(let modifiedProduct of modifiedProductsArray) {
            const quantity = modifiedProduct.inCart.quantity;
            session.deleteFromCart(modifiedProduct.inCart.id);
            session.addToCart(modifiedProduct.inDb, quantity);
        }

        res.locals.validProductsArray = validProductsArray;
        res.locals.modifiedProductsArray = modifiedProductsArray;
        res.locals.removedProductsArray = removedProductsArray;
        req.session.save((err) => {
            next();
        })

    }

    showNewOrderPage(req, res) {
        let session = new UserSession(req.session);

        res.render('new-order', {
            session: session.getModel(),
            validProducts: res.locals.validProductsArray,
            modifiedProducts: res.locals.modifiedProductsArray,
            removedProducts: res.locals.removedProductsArray,
            totalPrice: session.cartModel.getTotalPrice()
        });
    }

    async handleNewOrder(req, res) {
        const session = new UserSession(req.session);
        const products = session.getCart();
        if(products == null || products.length == 0) return res.end('Invalid products in new order!');
        
        let result = await this.ordersRepository.createNew(session.getUser().id, products);

        console.log(result);
        if(result == null) {
            return res.end('Couldn\'t add new order');
        }

        session.emptyCart();
        await req.session.save((err) => {
            if(err) {
                console.log('Error while emptying cart!');
            }
            console.log('done!');
            console.log(JSON.stringify(req.session));
            return res.redirect('/orders');
        });
    }
}

module.exports = Order;