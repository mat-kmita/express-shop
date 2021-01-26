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

    async update(user) {
        const column_names = {
            'fistName': 'first_name',
            'lastName': 'last_name',
            'street': 'address_street',
            'buildingNumber': 'address_building_number',
            'flatNumber': 'address_flat_number',
            'postalCode': 'address_postal_code',
            'city': 'address_city'
        };
        let text = 'UPDATE users SET ';

        let queryText = '';
        for (let field in user) {
            if (user[field].len > 0) {

            }
        }

        // const query = new ParameterizedQuery({
        //     text: p
        // })

        // try {
        //     await this.conn.none(query);
        // } catch(err) {
        //     console.error("Error while inserting user into database!");
        //     console.error(err.message);
        //     console.error(err.code);
        //     return false;
        // }

        return {};
    }

    async delete(user) {

    }
}

class ProductsRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async getById(id) {

    }

    async getAll() {

    }

    async getAllInCategory(categoryId) {

    }

    async findByName(search) {

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

    async getPage(userId, pageNumber, pageLength) {
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

        // console.log(JSON.stringify(result));

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

module.exports = function(conn) {
    return {
        UserRepository: new UserRepository(conn),
        CategoriesRepository: new CategoriesRepository(conn),
        OrdersRepository: new OrdersRepository(conn),
        OrdersProductsRepository: new OrdersProductsRepository(conn)
    }
}