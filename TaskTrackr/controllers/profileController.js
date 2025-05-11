const db = require(`../config/data/${process.env.DB_METHOD}`);
const speakeasy = require('speakeasy');
const qr = require('qrcode');
const encryption = require('../util/encryption');
const authUtil = require('../util/authUtil');

class ProfileController {
    static async getMain(req, res) {
        let tokens = await db.getTokensForUser(req.user);
        if(!tokens)
            tokens = [];
        const has2FA = (await db.getUserById(req.user.user_id)).otp_secret !== null;

        let alert = undefined;
        if(req.cookies.alert) {
            alert = req.cookies.alert;
            res.setHeader('set-cookie', 'alert=; max-age=0');
        }

        res.render('profile/main', {title: "Profile", user: req.user, tokens: tokens, has2FA: has2FA, alert: alert})
    }

    static async postMainName(req, res){
        const {name, email} = req.body;

        const user = await db.getUserById(req.user.user_id);
        user.name = name;

        if(user.email !== email && (await db.getEmailCount(email)) === 0) {
            user.email = email;
        } else if(user.email !== email && (await db.getEmailCount(email)) > 0){
            res.cookie('alert', 'Failed to change email - already in use', {maxAge: 2147483647, httpOnly: true})
            return res.redirect('/profile');
        }
        await db.updateUser(user);
        res.redirect('/profile');
    }

    static async postMainPass(req, res){
        const {oldPassword, password} = req.body;

        const user = await db.getUserById(req.user.user_id);

        const auth = await db.verifyCredentials(req.user.email, oldPassword)
        const authUser = auth.user;

        if(authUser) {
            user.password = password;
            await db.updateUser(user);

            res.cookie('authToken', "", {maxAge: 0, httpOnly: true, secure:true})
            res.redirect('/auth/login')
        } else {
            res.cookie('alert', 'Failed to change password - Please try again', {maxAge: 2147483647, httpOnly: true})
            res.redirect('/profile');
        }
    }

    static async get2FA(req, res){
        const user = await db.getUserById(req.user.user_id);

        if(user.otp_secret) {
            res.render('profile/modal/2faRemove', {title: ""});
        } else {
            const secret = speakeasy.generateSecret();
            res.cookie('secret', encryption.encryptData(secret.base32), {maxAge: 2147483647, httpOnly: true, secure:true})

            qr.toDataURL(secret.otpauth_url, function (err, data_url) {
                res.render('profile/modal/2faAdd', {title: "", image_url: data_url});
            });
        }
    }

    static async post2FARemove(req, res){
        const {otp} = req.body;
        const user = await db.getUserById(req.user.user_id);
        const verified = speakeasy.totp.verify({secret: user.otp_secret, encoding: 'base32', token: otp});

        if(verified){
            await db.setUserOTPSecret(req.user, null);
            res.redirect('/profile');
            return;
        }
        res.cookie('alert', 'Failed to remove 2FA - Please try again', {maxAge: 2147483647, httpOnly: true})
        res.redirect('/profile');
    }

    static async post2FA(req, res){
        const {otp} = req.body;

        const secret = encryption.decryptData(req.cookies['secret']);
        res.setHeader('set-cookie', 'secret=; max-age=0');

        const verified = speakeasy.totp.verify({secret: secret, encoding: 'base32', token: otp});

        if(verified){
            await db.setUserOTPSecret(req.user, secret);

            res.redirect('/profile');
            return;
        }
        res.cookie('alert', 'Failed to add 2FA - Please try again', {maxAge: 2147483647, httpOnly: true})
        res.redirect('/profile');
    }

    static async postTokenAdd(req, res) {
        const {token_name} = req.body;

        if (token_name && token_name.length > 2) {
            const token = await db.createToken(req.user, token_name);
            res.send({token: token});
        }
    }

    static async postTokenDelete(req, res){
        const token = await db.getTokenByName(req.body.token_name, req.user);

        if(token){
            await db.deleteToken(token);
            res.send({success: "true"});
            return;
        }
        res.send({success: "false"})
    }

}

module.exports = ProfileController;