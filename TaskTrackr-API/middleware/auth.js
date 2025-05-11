const db = require("../config/data/db-direct");
const {verify} = require("jsonwebtoken");
const log = require("../util/logUtil");

/**
 * Multi function middleware for both web app and API authentication.
 * Checks for Bearer Token headers
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 * @returns {Promise<void>}
 */
const isAuthenticatedAPIToken = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        //This looks like an API request

        const token = req.headers.authorization.split('Bearer ')[1];
        const user = await db.getUserFromToken(token);
        if (user) {
            res.locals.loggedin = true;
            delete user.password;
            delete user.otp_secret;
            req.user = user
            next();
            return;
        }
        res.status(401).send('Unauthorized');
    }
    res.status(401).send('Unauthorized');
};

const isAuthenticatedJWTToken = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {

        const token = req.headers.authorization.split('Bearer ')[1];

        if (!token) {
            return res.status(401).send('Unauthorized');
        }

        // If there is a cookie, verify it
        verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
            if (err) {
                log("Auth", `Attempt to auth with invalid JWT : ${token} : ${err}`);
                return res.status(401).json({status: 'Unauthorized'});
            }

            // If there is no error, continue the execution
            const userAcc = await db.getUserByEmail(data.email);
            try {
                delete userAcc.password;
                delete userAcc.otp_secret;
                req.user = userAcc
                next();
            } catch (error) {
                return res.status(401).json({status: 'Unauthorized'});
            }
        })
    } else {
        res.status(401).json({status: 'Unauthorized'});
    }
};

module.exports = {
    isAuthenticatedAPIToken,
    isAuthenticatedJWTToken
};
