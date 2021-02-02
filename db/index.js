const pgp = require('pg-promise')();

// const connectionDetails = {
//     username: 'mateusz',
//     password: 'abcd900',
//     host: 'localhost',
//     port: '5432',
//     database: 'mateusz'
// }

// const db = pgp(`postgres://${connectionDetails.username}:${connectionDetails.password}@${connectionDetails.host}:${connectionDetails.port}/${connectionDetails.database}`);
const db = pgp(process.env.DATABASE_URL);

async function initializeDatabase() {
    const queryFile = new pgp.QueryFile('./db/sql/create_database.sql');

    try {
        await db.none(queryFile);
    } catch(err) {
        console.error("Error while initializing database.");
        console.error(err.message);
        // exit(1);
    }
}

module.exports = {
    connection: db,
    initializeDatabase: initializeDatabase
}