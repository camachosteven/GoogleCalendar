const db = require('../../util/database');

module.exports.addEvent = (when, from, to, title, location) => {
    const query = `
        INSERT INTO events VALUES ('${when}', '${title}', '${location}', '${from}', '${to}');
    `;
    db.execute(query);
}

module.exports.getAllEvents = async (start, end, callback) => {
    try {
        const query = `
            SELECT * 
            FROM events
            WHERE \`when\` BETWEEN '${start}' and '${end}';
        `;
        const [rows, fields] = await db.execute(query);
        callback(rows);
    } catch (error) {
        console.log(error);
    }
};