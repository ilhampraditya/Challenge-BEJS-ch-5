require('dotenv').config();
const express = require("express");
const logger = require('morgan');
const app = express();
const cors = require("cors");
const router = require("./routes/v1")

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded());

app.use(router);

// 404 error handling
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `are you lost? ${req.method} ${req.url} is not registered!`,
        data: null,
    });
});

// 500 error handling
app.use((err, req, res, next) => {
    res.status(500).json({
        status: false,
        message: err.message || "Internal Server Error",
        data: null,
    });
});

module.exports = app;