// library imports
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
require('dotenv').config()

// local imports
const mongoDBConnect = require('./hooks/mongoDBConnect');
const logsRoutes = require('./routes/logsRouter');
const rootRoutes = require('./routes/rootRouter');
const userRoutes = require('./routes/userProfilesRouter');
const consumerRoutes = require('./routes/consumerRouter');

// create app
const app = express();

// connect DB
mongoDBConnect.connectDB();

// TODO ??? Add API Token to make it more secure

const {sendMail} = require("./hooks/emailConfig");

// sendMail(`anigokul432@gmail.com`, `Hello From Skill Swipe`, `Text`, `<h2>Hello Ani</h2> <img src="https://i.ytimg.com/vi/2MCFwDhoqqc/sddefault.jpg?sqp=-oaymwEmCIAFEOAD8quKqQMa8AEB-AHeA4AC4AOKAgwIABABGHIgTChCMA8=&rs=AOn4CLBf2Q-AURMmoVtms0bURMg-5LQNow"/>`);

// some options 
app.use(express.json())
app.use(cors({
    origin: '*' 
}));
app.use('/static', express.static('public'))

// add routes
app.use('/', rootRoutes);
app.use('/logs', logsRoutes);
app.use('/user', userRoutes);
app.use('/consumer', consumerRoutes);
// app.use('/user', userRoutes);


// start listening for connections
mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB')
    app.listen(process.env.PORT, ()=>{
        console.log('Server started on port ' + process.env.PORT);
    });
})