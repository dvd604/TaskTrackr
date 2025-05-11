/**
 * @file Entrypoint for TaskTrackr-API
 */

require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const log = require('./util/logUtil');

const app = express();

//Add middleware as required
app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({extended: false}));

const apiRouter = require('./routes/api');
app.use(apiRouter.path, apiRouter.router);

const internalApiRouter = require('./routes/internal');
app.use(internalApiRouter.path, internalApiRouter.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({status: 'error', message: err.message});
});

app.listen(process.env.SERVER_PORT, process.env.INTERFACE_ADDRESS, () => {
    log("SERV", `Listening on ${process.env.INTERFACE_ADDRESS}:${process.env.SERVER_PORT}`);
})

module.exports = app;
