const authUtil = require('../util/authUtil');
const dbHandler = require(`../config/data/${process.env.DB_METHOD}`);
const encryption = require("../util/encryption");
const speakeasy = require("speakeasy");
const validator = require('validator');

class AuthController {
    // Display login form
    static getLogin(req, res) {
        res.render('auth/login', {
            title: 'Login',
            errors: undefined,
            email: undefined
        });
    }

    // Handle login
    static async postLogin(req, res) {
        try {
            const {email, password} = req.body;
            const user = await dbHandler.verifyCredentials(email, password);

            if (!user.user) {
                return res.render('auth/login', {
                    title: 'Login',
                    errors: ['Invalid email or password'],
                    email: req.body.email
                });
            }

            if(!user.user.otp_secret) {
                res.cookie('authToken', user.token, {maxAge: 2147483647, httpOnly: true, secure:true})
                res.redirect('/dashboard');
            } else {
                res.cookie('usersecret', encryption.encryptData(JSON.stringify(
                    {email: email, password: password}
                )), {maxAge: 2147483647, httpOnly: true, secure:true})

                res.redirect('/auth/2fa');
            }

        } catch (error) {
            res.render('auth/login', {
                title: 'Login',
                errors: [error.message],
                email: req.body.email
            });
        }
    }

    static async get2FA(req, res){
        res.render('auth/2fa', {title: "2FA Challenge"})
    }

    static async post2FA(req, res) {
        const secret = req.cookies['usersecret'];
        const {email, password} = JSON.parse(encryption.decryptData(secret));
        const {otp} = req.body;

        const {user, token} = await dbHandler.verifyCredentials(email, password);

        const verified = speakeasy.totp.verify({secret: user.otp_secret, encoding: 'base32', token: otp});

        if(verified){
            res.clearCookie('usersecret');
            res.cookie('authToken', token, {maxAge: 2147483647, httpOnly: true, secure:true})
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }

    }

    // Display registration form
    static getRegister(req, res) {
        res.render('auth/register', {
            title: 'Register',
            errors: undefined
        });
    }

    // Handle registration
    static async postRegister(req, res) {
        try {
            const errors = await validateRegistration(req);
            if (!(errors === undefined || errors.length === 0)) {
                return res.render('auth/register', {
                    title: 'Register',
                    errors: errors,
                    ...req.body
                });
            }

            let user = req.body;
            user = authUtil.setupNewUser(user);

            const result = await dbHandler.saveUser(user);
            res.cookie('authToken', result.token, {maxAge: 2147483647, httpOnly: true, secure:true})
            res.redirect('/dashboard');
        } catch (error) {
            res.render('auth/register', {
                title: 'Register',
                errors: error.message
            });
        }
    }

    // Handle logout
    static logout(req, res) {
        res.clearCookie('authToken');
        res.redirect('/auth/login');
    }
}

async function validateRegistration(req) {
    const errors = [];
    const {email, name, username, password} = req.body;

    if(!validator.isEmail(email))
        errors.push('Invalid email');

    const user = await dbHandler.getEmailCount(email);
    if(user)
        errors.push('Email already in use');

    if(!name || name.length < 3)
        errors.push('Invalid name');

    if(!username || username.length < 3)
        errors.push('Invalid username');

    if(!password || password.length < 3)
        errors.push('Invalid password');

    return errors;
}

module.exports = AuthController;
