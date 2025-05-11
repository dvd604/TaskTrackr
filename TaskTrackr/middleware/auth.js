const {verify} = require("jsonwebtoken");
const db = require(`../config/data/${process.env.DB_METHOD}`);
const log = require('../util/logUtil');

/**
 * Multi function middleware for both web app and API authentication.
 * Checks for authToken cookies
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 * @returns {Promise<void>}
 */
const isAuthenticated = async (req, res, next) => {
    const authCookie = req.cookies['authToken'];

    if (!authCookie) {
        res.locals.loggedin = false;
        res.locals.name = undefined;
        res.redirect('/auth/login');
        return;
    }

    // If there is a cookie, verify it
    verify(authCookie, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err) {
            log("Auth", `Attempt to auth with invalid JWT : ${err}`);
            res.clearCookie("authToken");
            res.redirect('/auth/login');
            res.locals.loggedin = false;
            res.locals.name = undefined;
            return;
        }

        res.locals.loggedin=true;
        db.setContext({authKey: req.cookies['authToken']});
        // If there is no error, continue the execution
        const userAcc = await db.getUserByEmail(data.email);

        try {
            delete userAcc.password;
            delete userAcc.otp_secret;
            req.user = userAcc
            res.locals.name = userAcc.name;
            next();
        } catch (err) {
            log("Auth", `Attempt to auth with error : ${err}`);
            res.clearCookie("authToken");
            return res.redirect('/auth/login');
        }
    })
};

module.exports = {
    isAuthenticated
};
