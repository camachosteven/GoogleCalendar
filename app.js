const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const env = require('dotenv');
const app = express();

// added this to config vars
let directory;
if (!process.env.HEROKU_PRODUCTION) {
    env.config();
    const livereload = require('livereload');
    const connectLiveReload = require('connect-livereload');
    app.use(connectLiveReload());
    // livereload for development
    const reloadServer = livereload.createServer();
    reloadServer.watch(path.join(__dirname, 'MVC', 'Views'));
    reloadServer.server.once('connection', () => {
        setTimeout(() => {
            reloadServer.refresh('/');
        }, 100);
    });
    directory = __dirname;
} else {
    directory = process.cwd();
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(directory, 'MVC', 'Views', 'static')));

app.set('views', 'MVC/Views');
app.set('view engine', 'ejs');

// Routes
const mainRoutes = require('./routes/main');
app.use(mainRoutes);

const PORT = process.env.PORT;
const HOST = process.env.HOST;
app.listen(PORT, HOST);