const express = require('express');
const router = express.Router();
let {isAuthenticated} = require('../middleware/auth');
const profileController = require('../controllers/profileController')
const nav = require('../middleware/nav');


router.get('/', isAuthenticated, profileController.getMain);
router.post('/name', isAuthenticated, profileController.postMainName);
router.post('/pass', isAuthenticated, profileController.postMainPass);

router.get('/modal/2fa', isAuthenticated, profileController.get2FA);
router.post('/modal/2fa', isAuthenticated, profileController.post2FA);
router.post('/modal/2fa/remove', isAuthenticated, profileController.post2FARemove);

router.post('/token/add', isAuthenticated, profileController.postTokenAdd);
router.post('/token/delete', isAuthenticated, profileController.postTokenDelete);

nav.addNavLink(`/profile`, `Profile`, 4000);

module.exports = {router: router, path: "/profile"};
