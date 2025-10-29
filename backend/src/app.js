
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();

const corsOption = {
    origin:process.env.CLIENT_URL,
    methods:['GET','POST','PUT','DELETE',"PATCH"],
    credentials:true,
    optionsSuccessStatus:200
}
// Middleware
app.use(cors(corsOption));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser())

// Routes import
    const userRoutes = require('./routes/user.routes');

// Routes Middleware
    app.use('/api/v1/users', userRoutes);



module.exports = app;