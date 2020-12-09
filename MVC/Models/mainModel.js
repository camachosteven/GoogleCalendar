const db = require('../../util/database');

module.exports.addEvent = (when, from, to, title, location) => {
    const query = `
        INSERT INTO events VALUES ('${when}', '${title}', '${location}', '${from}', '${to}');
    `;
    db.execute(query);
}

module.exports.getAllEvents = async callback => {
    try {
        const [rows, fields] = await db.execute('SELECT * FROM events;');
        callback(rows);
    } catch (error) {
        console.log(error);
    }
};