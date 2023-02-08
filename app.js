// library imports
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
require('dotenv').config()

// local imports
const mongoDBConnect = require('./mongoDBConnect');
const logsController = require('./controllers/logsController');
const rootController = require('./controllers/rootController');


// create app
const app = express();

// connect DB
mongoDBConnect.connectDB();

// TODO: Add API Token to make it more secure

// some options 
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:19006'
}));

// add routes from controllers
app.use('/', rootController);
app.use('/logs', logsController);

// start listening for connections
mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB')
    app.listen(3000, ()=>{
        console.log('Server started on port ' + process.env.PORT);
    });
})