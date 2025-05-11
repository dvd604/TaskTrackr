const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
let {isAuthenticated} = require('../middleware/auth');
const nav = require('../middleware/nav');

router.get('/list', isAuthenticated, taskController.getList);

router.get('/remove', isAuthenticated, taskController.getRemove);

router.get('/modal/inspect', isAuthenticated, taskController.getInspect);
router.post('/modal/inspect', isAuthenticated, taskController.postInspect);

router.get('/modal/add', isAuthenticated, taskController.getAdd);
router.post('/modal/add', isAuthenticated, taskController.postAdd);

router.post('/status/set', isAuthenticated, taskController.postStatusSet);

router.get('/', isAuthenticated, function (req, res, next) {
    res.redirect('/dashboard');
});

nav.addNavLink('/task/list', 'Tasks', 1000);

module.exports = {router: router, path: "/task"};
