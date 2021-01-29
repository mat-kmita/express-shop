class OrdersProductsRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async getProductsForOrder(orderId) {
        let query = 'SELECT * FROM orders_products JOIN products ON products.id = orders_products.product_id WHERE orders_products.order_id = $1';
        let result;

        try {
            result = this.conn.many(query, [orderId]);
        } catch(err) {
            console.log(err);
            result = null;
        }

        return result;
    }
}

module.exports = OrdersProductsRepository;