
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

module.exports = AdminsRepository;