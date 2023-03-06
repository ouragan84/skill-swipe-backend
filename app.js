// library imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
require('dotenv').config()

// local imports
const mongoDBConnect = require('./hooks/mongoDBConnect');
const rootRoutes = require('./routes/rootRouter');
const userRoutes = require('./routes/userProfilesRouter');
const companyRoutes = require('./routes/companyProfileRouter');
const consumerRoutes = require('./routes/consumerRouter');

// create app
const app = express();

// connect DB
mongoDBConnect.connectDB();

// some options 
app.use(express.json())
app.use(cors({
    origin: '*' 
}));
app.use('/static', express.static('public'))
app.use(bodyParser.raw({
    type: 'image/png',
    limit: '10mb'
  }));
app.use(bodyParser.raw({
    type: 'image/jpeg',
    limit: '10mb'
  }));
app.use(bodyParser.raw({
    type: 'image/gif',
    limit: '10mb'
  }));

// add routes
app.use('/', rootRoutes);
app.use('/user', userRoutes);
app.use('/company', companyRoutes);
app.use('/consumer', consumerRoutes);

// start listening for connections
mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB')
    app.listen(process.env.PORT, ()=>{
        console.log('Server started on port ' + process.env.PORT);
    });
})