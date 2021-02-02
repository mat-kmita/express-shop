const CartModel = require('./cart-model');

class UserSession {
    constructor(session) {
        this.cartModel = new CartModel(session.cart);
        this.session = session;
    }

    isUserLoggedIn() {
        return this.session.user != null;
    }

    isCartEmpty() {
        return this.cartModel.isCartEmpty();
    }

    getUser() {
        if(this.session == null) {
            return null;
        }

        return this.session.user;
    }

    getCart() {
        if(this.session == null) {
            return null;
        }

        return this.session.cart;
    }

    getModel() {
        return {
            loggedIn: this.isUserLoggedIn(),
            cartEmpty: this.isCartEmpty(),
            user: this.getUser(),
            cart: this.getCart(),
            cartTotal: this.cartModel.getTotalPrice()
        }
    }

    logIn(user, cb) {
        this.session.user = user;
        this.session.cart = [];

        this.session.save((err) => {
            if(err) throw 'Cannot log in!';

            return cb();
        })
    }

    logout(cb) {
        if(this.session == null) {
            throw 'No user logged in!';
        }

        this.session.destroy((err) => {
            if(err) throw 'Cannot log out!';

            return cb();
        });
    }

    addToCart(product, quantity) {
        this.cartModel.addOrUpdateProduct(product, quantity);
    }

    deleteFromCart(id) {
        this.cartModel.removeProductFromCart(id);
    }

    emptyCart() {
        this.cartModel.emptyCart();
    }
}

module.exports = UserSession;