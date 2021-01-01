const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const env = require('dotenv');
const app = express();

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
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'MVC', 'views', 'static')));

app.set('views', 'MVC/views');
app.set('view engine', 'ejs');

// Routes
const mainRoutes = require('./routes/main');
app.use(mainRoutes);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST);