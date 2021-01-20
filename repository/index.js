const {ParameterizedQuery} = require('pg-promise');

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

    }

    async delete(user) {

    }
}

module.exports = function(conn) {
    return {
        UserRepository: new UserRepository(conn)
    }
}