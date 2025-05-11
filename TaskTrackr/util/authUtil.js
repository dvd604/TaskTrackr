const bcrypt = require("bcryptjs");
const dbHandler = require(`../config/data/${process.env.DB_METHOD}`);
const {v4: uuidv4} = require('uuid');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


/**
 * Takes an incomplete user object and sets the creation time and GUID
 * @param user - The user to complete
 * @returns {user} A complete user object
 */
function setupNewUser(user){
    if(!user.guid || !user.create_time){
        user.guid = uuidv4();
        user.create_time = Math.floor(Date.now() / 1000)
    }

    return user;
}

module.exports = {setupNewUser: setupNewUser};