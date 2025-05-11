const jwt = require("jsonwebtoken");

/**
 * Creates and issues an authentication token, sets an authToken cookie and returns the user to /dashboard
 * @param user - The user to issue the JWT for
 */
function issueJWT(user){
    const {username, email} = user;
    return jwt.sign({email, username}, process.env.ACCESS_TOKEN_SECRET);
}

module.exports = {issueJWT: issueJWT};