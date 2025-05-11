/**
 * @file Entrypoint for TaskTrackr
 * Has been designed to need very little modification as it searches for and mounts routes dynamically,
 * and allows specification of listen address and port by environment variables
 */

require('./instrument');

const express = require('express');
const Sentry = require("@sentry/node");
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const log = require('./util/logUtil');
const fs = require('fs');
const favicon = require('serve-favicon');
const nav = require('./middleware/nav');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Add middleware as required
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use((req, res, next) => {
    res.locals.curPath = req.originalUrl;
    res.locals.ua = req.get('User-Agent');
    next();
})
app.use(nav.buildNavbar);

//Our route loader searches the routes directory and attempts to load each one.
//Each route file specifies where it wants to be mounted to, and this allows for easy
//addition of new routes.
log("Route", "Starting Route Loader");
fs.readdirSync('./routes').forEach(route => {
    const router = require(`./routes/${route}`);

    if (router.router && router.path) {
        if (router.shouldMount) {
            const shouldMount = router.shouldMount();

            if (!shouldMount.result) {
                log("Route", `Router ${route} disallowed mounting with reason: ${shouldMount.reason}`);
                return;
            }
        }

        app.use(router.path, router.router);
        log("Route", `Mounted ${route} to ${router.path}`);
    } else {
        log("Route", `${route} is an invalid Router`);
    }
});
log("Route", "Route Loader Complete");

//Hook sentry in before other error handling
Sentry.setupExpressErrorHandler(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.sentry_id = res.sentry;

    // render the error page
    res.status(err.status || 500);
    res.render('error', {title: "Error"});
});

module.exports = app;
