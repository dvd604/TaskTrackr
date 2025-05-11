const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
let {isAuthenticatedAPIToken} = require('../middleware/auth');

router.get('/task', isAuthenticatedAPIToken, apiController.getTasks);
router.post('/task', isAuthenticatedAPIToken, apiController.postTask);
router.delete('/task', isAuthenticatedAPIToken, apiController.deleteTask);
router.put('/task', isAuthenticatedAPIToken, apiController.updateTask);
router.patch('/task', isAuthenticatedAPIToken, apiController.patchTask);

router.get('/status', isAuthenticatedAPIToken, apiController.getStatuses);

router.get('/priority', isAuthenticatedAPIToken, apiController.getPriority);

router.get('/project', isAuthenticatedAPIToken, apiController.getProjects);
router.post('/project', isAuthenticatedAPIToken, apiController.postProject);
router.delete('/project', isAuthenticatedAPIToken, apiController.deleteProject);
router.patch('/project', isAuthenticatedAPIToken, apiController.updateProject);
router.put('/project', isAuthenticatedAPIToken, apiController.updateProject);

router.get('/project/invite', isAuthenticatedAPIToken, apiController.getInvite);
router.get('/project/invite/accept', isAuthenticatedAPIToken, apiController.acceptInvite);

router.get('/user', isAuthenticatedAPIToken, apiController.getUser);

module.exports = {router: router, path: "/v1"};
