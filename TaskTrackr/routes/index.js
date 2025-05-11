const express = require('express');
const router = express.Router();
const DashController = require("../controllers/dashController");
const nav = require('../middleware/nav');
let {isAuthenticated} = require('../middleware/auth');

/* GET home page. */
router.get('/', isAuthenticated, function (req, res, next) {
    res.redirect("/dashboard");
});

router.get('/dashboard', isAuthenticated, DashController.getDash);

nav.addNavLink("/dashboard", "Dashboard", 0);

module.exports = {router: router, path: "/"};
