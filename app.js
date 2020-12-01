const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
express.static(path.join(__dirname, 'MVC', 'views', 'static'));

app.set('views', 'MVC/views');
app.set('view engine', 'ejs');

// Routes
const mainRoutes = require('./routes/main');
app.use(mainRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT);