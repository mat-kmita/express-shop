class OrdersRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async get(orderId) {
        let query = 'SELECT * FROM orders WHERE id = $1';
        let result;

        try {
            result = this.conn.oneOrNone(query, [orderId]);
        } catch(err) {
            console.error('Error while retrieving order with id ' + orderId);
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async getPageForUser(userId, pageNumber, pageLength) {
        let query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY date OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY';
        let result;

        try {
            result = await this.conn.manyOrNone(query, [userId, pageLength * (pageNumber - 1), pageLength]);
        } catch(err) {
            console.error('Error while retrieving orders from database!');
            console.error(err.message);
            result = null;
        }

        console.log(`Fetch result: ${result}`);

        return result;
    }


    async getPage(pageNumber, pageLength) {
        let query = 'SELECT * FROM orders ORDER BY date OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY';
        let result;

        try {
            result = await this.conn.manyOrNone(query, [pageLength * (pageNumber - 1), pageLength]);
        } catch(err) {
            console.error('Error while retrieving orders from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async getCountForUser(userId) {
        let query = 'SELECT count(*) AS count FROM orders WHERE user_id = $1';
        let result;

        try {
            result = await this.conn.oneOrNone(query, [userId]);
        } catch(err) {
            console.error('Error while retrieving count of orders for user');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async getCount() {
        let query = 'SELECT count(*) AS count FROM orders';
        let result;

        try {
            result = await this.conn.one(query);
        } catch(err) {
            console.error('Error while retrieving count of orders for user');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async createNew(userId, products) {
        let result = null;
        await this.conn.tx(async t => {
            let newOrder = await t.one('INSERT INTO orders(user_id) VALUES ($1) RETURNING id', [userId]);
            let newOrderId = parseInt(newOrder.id);
            console.log('order id: ' + JSON.stringify(newOrderId))

            for(const product of products) {
                await t.none('INSERT INTO orders_products(order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [newOrderId, product.id, product.quantity, product.price]);
            }

            return t.one('UPDATE orders SET amount = (SELECT sum(price) FROM orders_products WHERE order_id = $1) WHERE id = $2 RETURNING id', [newOrderId, newOrderId]);
        }).then(d => {
            result = d.id;
        }).catch(err => {
            console.error('Error in transaction!');
            console.error(err.message);
            result = null;
        });

        return result;
    }
}

module.exports = OrdersRepository;