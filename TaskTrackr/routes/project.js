const express = require('express');
const router = express.Router();
let {isAuthenticated} = require('../middleware/auth');
const projectController = require('../controllers/projectController')
const nav = require('../middleware/nav');

router.get('/', isAuthenticated, function (req, res, next) {
    res.redirect('/dashboard');
});

router.post('/user/remove', isAuthenticated, projectController.postUserRemove);
router.get('/user/invite', isAuthenticated, projectController.getUserInvite);

router.get('/invite/create', isAuthenticated, projectController.getInviteCreate);

router.get('/list', isAuthenticated, projectController.getList);

router.get('/modal/add', isAuthenticated, projectController.getAdd);
router.post('/modal/add', isAuthenticated, projectController.postAdd);

router.get('/modal/inspect', isAuthenticated, projectController.getInspect);
router.post('/modal/inspect', isAuthenticated, projectController.postInspect);

router.get('/modal/delete', isAuthenticated, projectController.getDelete);

nav.addNavLink('/project/list', 'Projects', 2000);

module.exports = {router: router, path: "/project"};
