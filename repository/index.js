const {ParameterizedQuery} = require('pg-promise');


function prepareUpdateQuery(tableName, map) {
    let query = 'UPDATE '
}

class UserRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async get(username) {
        const query = new ParameterizedQuery({
            text: "SELECT * FROM users WHERE username=$1",
            values: [username]
        });

        var result;
        try {
            result = await this.conn.oneOrNone(query);
        } catch(err) {
            console.error('Error while retrieving user from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async insert(user) {
        const query = new ParameterizedQuery({
            text: 'INSERT INTO users(username, password_hash) VALUES ($1, $2)',
            values: [user.username, user.passwordHash]
        });

        try {
            await this.conn.none(query);
        } catch(err) {
            console.error("Error while inserting user into database!");
            console.error(err.message);
            console.error(err.code);
            return false;
        }

        return true;
    } 

    async getPage(pageNumber, pageLength) {
        let query = 'SELECT * FROM users ORDER BY id OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY';
        let result;

        try {
            result = await this.conn.manyOrNone(query, [pageLength * (pageNumber - 1), pageLength]);
        } catch(err) {
            console.error('Error while retrieving users from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async getCountOfUsers() {
        let query = 'SELECT count(*) AS count FROM users';
        let result;
    
        try {
            result = await this.conn.one(query);
        } catch(err) {
            console.error('Error while retrieving count of users');
            console.error(err.message);
            result = null;
        }

        return result;
    }}

class ProductsRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async get(id) {
        let query = 'SELECT * FROM products WHERE id = $1';

        let result;
        try {
            result = await this.conn.one(query, [id]);
        } catch(err) {
            console.error('Error while retrieving product');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async getPage(pageNumber, pageLength) {
        let query = 'SELECT * FROM products ORDER BY id OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY';
        let result;

        try {
            result = await this.conn.manyOrNone(query, [pageLength * (pageNumber - 1), pageLength]);
        } catch(err) {
            console.error('Error while retrieving products from database!');
            console.error(err.message);
            result = null;
        }

        console.log(`Fetch result: ${result}`);

        return result;
    }

    async getCountOfProducts() {
        let query = 'SELECT count(*) AS count FROM products';
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

    async insert(product) {
        let query = 'INSERT INTO products(name, description, price) VALUES ($1, $2, $3)'

        let result;
        try {
            result = await this.conn.none(query, [product.name, product.description, product.price]);
        } catch(err) {
            console.error("Error while inserting new product!");
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async update(productId, product) {
        let query = 'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *';

        let result;
        try {
            result = await this.conn.one(query, [product.name, product.description, product.price, productId]);
        } catch(err) {
            console.error("Error while updating product!");
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async delete(productId) {
        let query = 'DELETE FROM products WHERE id = $1 RETURNING name';

        let result;
        try {
            result = await this.conn.one(query, [productId]);
        } catch(err) {
            console.error("Error while updating product!");
            console.error(err.message);
            result = null;
        }

        return result;
    }

}

class CategoriesRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async getAll() {
        const query = "SELECT * FROM categories";

        var result;
        try {
            result = await this.conn.manyOrNone(query);
        } catch(err) {
            console.error('Error while retrieving user from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async insert(category) {

    }
}

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
}

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
        }

        return result;
    }
}

class AdminsRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async get(username) {
        const query = 'SELECT * FROM admins WHERE username=$1';

        var result;
        try {
            result = await this.conn.oneOrNone(query, [username]);
        } catch(err) {
            console.error('Error while retrieving admin from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }
}

module.exports =  {
        UserRepository: UserRepository,
        CategoriesRepository: CategoriesRepository,
        OrdersRepository: OrdersRepository,
        OrdersProductsRepository: OrdersProductsRepository,
        ProductsRepository: ProductsRepository,
        AdminsRepository: AdminsRepository
}