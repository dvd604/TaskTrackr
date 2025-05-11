const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();

router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.postLogin);

router.get('/2fa', AuthController.get2FA);
router.post('/2fa', AuthController.post2FA);

// Registration routes
router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.postRegister);

// Logout route
router.get('/logout', AuthController.logout);

module.exports = {router: router, path:"/auth"};
