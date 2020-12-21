const db = require('../../util/database');

module.exports.addEvent = async (when, from, to, title, location, callback) => {
    const query = `
        INSERT INTO events VALUES ('${when}', '${title}', '${location}', '${from}', '${to}');
    `;
    await db.execute(query);
    callback();
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

module.exports.getEvent = async (when, from, to) => {
    try {
        const query = `
            SELECT * FROM events 
            WHERE \`when\` = '${when}' 
            AND \`from\` = '${from}' 
            AND \`to\` = '${to}';
        `;
        const [rows, fields] = await db.execute(query);
        return rows;
    } catch (error) {
        console.log(error);
    }
};