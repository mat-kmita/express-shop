class CartModel {
    constructor(cartObject) {
        this.cart = cartObject ? cartObject : [];
    }

    getProductFromCart(id) {
        for (const product of this.cart) {
            if (product.id == id)
                return product;
        }

        return null;
    }

    addOrUpdateProduct(product, quantity) {
        for (let i = 0; i < this.cart.length; i++) {
            if (product.id == this.cart[i].id) {
                this.cart[i].quantity = quantity;
                return;
            }
        }

        this.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    removeProductFromCart(id) {
        let index = -1;

        for (let i = 0; i < this.cart.length; i++) {
            if (this.cart[i].id == id) {
                index = i;
                break;
            }
        }

        if (index != -1)
            this.cart.splice(index, 1);
    }

    isCartEmpty() {
        return !this.cart || this.cart.length == 0;
    }

    emptyCart() {
        this.cart.splice(0, this.cart.length);
    }

    getTotalPrice() {
        return this.cart.reduce((totalPrice, item) => { return totalPrice + item.price * item.quantity; }, 0);
    }
}

module.exports = CartModel;