// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes


module.exports = app;