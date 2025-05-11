const express = require('express');
const router = express.Router();
let {isAuthenticatedJWTToken} = require('../middleware/auth');
const internalController = require('../controllers/internalController');

router.post('/auth/', internalController.postAuth);

router.post('/user/', internalController.postUser); //Add user
router.put('/user/', isAuthenticatedJWTToken, internalController.patchUser); //Update user
router.get('/user/id/:id', isAuthenticatedJWTToken, internalController.getUserById) //Get user by ID
router.get('/user/email/:email', isAuthenticatedJWTToken, internalController.getUserByEmail) //Get user by email
router.get('/user/guid/:guid', isAuthenticatedJWTToken, internalController.getUserByGuid);
router.post('/user/token/add/:tokenName', isAuthenticatedJWTToken, internalController.createToken);
router.delete('/user/token/:token', isAuthenticatedJWTToken, internalController.deleteToken);
router.get('/user/token', isAuthenticatedJWTToken, internalController.getTokensForUser);
router.get('/user/token/name/:name', isAuthenticatedJWTToken, internalController.getTokenByName);
router.get('/user/token/:token', isAuthenticatedJWTToken, internalController.getUserFromToken);
router.post('/user/otp/set', isAuthenticatedJWTToken, internalController.setOTPSecret);

router.get('/email/:email', internalController.getEmailCount);

router.get('/user/log/', isAuthenticatedJWTToken, internalController.getStatusUpdatesForUser);
router.get('/user/log/:date', isAuthenticatedJWTToken, internalController.getStatusUpdatesForUserForDate);

router.post('/task/', isAuthenticatedJWTToken, internalController.postTask); //Add task
router.get('/task/guid/:guid', isAuthenticatedJWTToken, internalController.getTaskByGUID) // Get task by GUID
router.get('/task/owned/', isAuthenticatedJWTToken, internalController.getOwnedTasksForUser) //Get owned Tasks for user
router.get('/task/all/', isAuthenticatedJWTToken, internalController.getAllTasksForUser); //Get all tasks for user
router.get('/task/assigned/', isAuthenticatedJWTToken, internalController.getAssignedTasksForUser); //Get assigned tasks for user
router.put('/task/:id', isAuthenticatedJWTToken, internalController.updateTask);
router.get('/task/:id', isAuthenticatedJWTToken, internalController.getTaskById);
router.delete('/task/:id', isAuthenticatedJWTToken, internalController.removeTask);
router.post('/task/:id/status/:statusID', isAuthenticatedJWTToken, internalController.setTaskStatus);

router.get('/project/', isAuthenticatedJWTToken, internalController.getProjectsForUser); //Get projects for user
router.get('/project/guid/:guid', isAuthenticatedJWTToken, internalController.getProjectByGUID);
router.get('/project/:id', isAuthenticatedJWTToken, internalController.getProjectByID);
router.post('/project/', isAuthenticatedJWTToken, internalController.saveNewProjectWithUser);
router.get('/project/:id/users', isAuthenticatedJWTToken, internalController.getUsersWithAccessToProject);
router.post('/project/:id/users/add/', isAuthenticatedJWTToken, internalController.addUserToProject);
router.post('/project/:id/users/remove/:userID', isAuthenticatedJWTToken, internalController.removeUserFromProject);
router.get('/project/:id/tasks', isAuthenticatedJWTToken, internalController.getTasksFromProject);
router.delete('/project/:id', isAuthenticatedJWTToken, internalController.deleteProject);
router.put('/project/:id', isAuthenticatedJWTToken, internalController.updateProject);
router.get('/project/:id/invite/create', isAuthenticatedJWTToken, internalController.createInviteForProject);
router.get('/project/invite/:invite', isAuthenticatedJWTToken, internalController.getProjectFromInvite);
router.delete('/project/invite/:invite', isAuthenticatedJWTToken, internalController.removeInviteToken);

router.get('/webhook/', isAuthenticatedJWTToken, internalController.getWebhookTypes);
router.get('/webhook/project/:projectID', isAuthenticatedJWTToken, internalController.getWebhookForProject);
router.post('/webhook', isAuthenticatedJWTToken, internalController.setWebhook);
router.delete('/webhook/project/:projectID', isAuthenticatedJWTToken, internalController.deleteWebhookForProject);

router.get('/status/', isAuthenticatedJWTToken, internalController.getStatus);
router.get('/priorities/', isAuthenticatedJWTToken, internalController.getPriorities);


module.exports = {router: router, path: "/int"};
