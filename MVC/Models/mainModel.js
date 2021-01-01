const db = require('../../util/database');


// this method takes in all of the input from view and inserts it into db table
module.exports.addEvent = async (when, from, to, title, location, callback) => {
    const query = `
        INSERT INTO events (\`title\`, \`when\`, \`from\`, \`to\`, \`location\`) 
        VALUES ('${title}', '${when}', '${from}', '${to}', '${location}');
    `;
    await db.execute(query);
    callback();
}

// this method gets all methods that are within the start and end dates
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

// this method gets a specific event, used to check if there is an event occupying a specific date and time
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