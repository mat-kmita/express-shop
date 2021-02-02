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

        return result;
    }

    async findByName(name) {
        let regexString = `%${name}%`;
        let query = 'SELECT * FROM products WHERE name ILIKE $1';
        let result;

        try {
            result = await this.conn.manyOrNone(query, regexString);
        } catch(err) {
            console.error('Error while searching for products!');
            console.error(err.message);
            result = [];
        }

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

module.exports = ProductsRepository;