class UserRepository {
    constructor(conn) {
        this.conn = conn;
    }

    async get(username) {
        const query = 'SELECT * FROM users WHERE username=$1';

        let result;
        try {
            result = await this.conn.oneOrNone(query, [username]);
        } catch(err) {
            console.error('Error while retrieving user from database!');
            console.error(err.message);
            result = null;
        }

        return result;
    }

    async insert(user) {
        const query = 'INSERT INTO users(username, password_hash) VALUES ($1, $2)';

        try {
            await this.conn.none(query, [user.username, user.passwordHash]);
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
    }
}

module.exports = UserRepository