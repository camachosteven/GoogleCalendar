const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
}).promise();

const table = db.execute('SHOW TABLES LIKE "events";');
table.then(([rows, fields]) => { if (rows.length === 0) throw new Error('No table.') })
    .catch((error) => {
        return db.execute(`CREATE TABLE \`${process.env.DATABASE}\`.\`events\` (
            \`title\` VARCHAR(20) NOT NULL,
            \`location\` VARCHAR(30) NOT NULL,
            \`when\` DATE NOT NULL,
            \`from\` TIME NOT NULL,
            \`to\` TIME NOT NULL,
            PRIMARY KEY (\`when\`, \`from\`, \`to\`));
        `);
    }).catch(error => {
    });

module.exports = db;