const db = require("../config/data/db-direct");
const util = require("../util/authUtil");

/**
 * Helper function to ensure an object has all specified keys within
 * @param object The object to check
 * @param {...string} var_args The list of keys to check for
 * @returns {boolean} True if object has all keys, false otherwise
 */
function assertObjectHas(object, var_args) {
    let hasAll = true;
    if (arguments.length === 1) return true;

    for (let i = 1; i < arguments.length; i++) {
        const key = arguments[i];
        if (!(key in object)) hasAll = false;
    }

    return hasAll;
}

class InternalController {
    static async postAuth(req, res) {
        const validRequest = assertObjectHas(req.body, 'email', 'password');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const {email, password} = req.body;

        const user = await db.verifyUser(email, password);
        if (!user) {
            return res.status(401).json({status: "failure", reason: "Invalid email or password"});
        }
        const token = util.issueJWT(user);
        return res.status(200).json({status: "success", token: token, user: user});
    }

    static async postUser(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'username', 'email', 'guid', 'create_time');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.saveUser(req.body);
        const token = util.issueJWT(req.body);
        return res.status(200).json({status: "success", data: value, token: token});
    }

    static async patchUser(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'username', 'email', 'guid', 'create_time');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.updateUser(req.body);
        return res.status(200).json({status: "success", data: value});
    }

    static async getUserById(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getUserById(req.params.id);

        if (!value) {
            return res.status(404).json({status: "failure", reason: "No Such User"})
        }

        return res.status(200).json({status: "success", data: value});
    }

    static async getUserByEmail(req, res) {
        const validRequest = assertObjectHas(req.params, 'email');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getUserByEmail(req.params.email);

        if (!value) {
            return res.status(404).json({status: "failure", reason: "No Such User"})
        }
        return res.status(200).json({status: "success", data: value});
    }

    static async getUserByGuid(req, res) {
        const validRequest = assertObjectHas(req.params, 'guid');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getUserByGUID(req.params.guid);

        if (!value) {
            return res.status(404).json({status: "failure", reason: "No Such User"})
        }
        return res.status(200).json({status: "success", data: value});
    }

    static async createToken(req, res) {
        const validRequest = assertObjectHas(req.params, 'tokenName');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.createToken(req.user, req.params.tokenName);
        return res.status(200).json({status: "success", data: value});
    }

    static async deleteToken(req, res) {
        const validRequest = assertObjectHas(req.params, 'token');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.deleteToken(req.params.token);
        return res.status(200).json({status: "success", data: value});
    }

    static async getTokensForUser(req, res) {
        const value = await db.getTokensForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getTokenByName(req, res) {
        const validRequest = assertObjectHas(req.params, 'name');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getTokenByName(req.params.name, req.user);

        if (!value) {
            return res.status(404).json({status: "failure", reason: "No Such Token"})
        }

        return res.status(200).json({status: "success", data: value});
    }

    static async getUserFromToken(req, res) {
        const validRequest = assertObjectHas(req.params, 'token');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getUserFromToken(req.params.token);

        if (!value) {
            return res.status(404).json({status: "failure", reason: "No Such Token"})
        }

        return res.status(200).json({status: "success", user: value});
    }

    static async setOTPSecret(req, res) {
        const validRequest = assertObjectHas(req.body, 'secret');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.setUserOTPSecret(req.user, req.body.secret);
        return res.status(200).json({status: "success"});
    }

    static async getEmailCount(req, res) {
        const validRequest = assertObjectHas(req.params, 'email');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getEmailCount(req.params.email);
        return res.status(200).json({data: value});
    }

    static async getStatusUpdatesForUser(req, res) {
        const value = await db.getStatusUpdatesForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getStatusUpdatesForUserForDate(req, res) {
        const validRequest = assertObjectHas(req.params, 'date');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getTaskLogsForDate(req.user, Math.floor(req.params.date * 1000));
        return res.status(200).json({status: "success", data: value});
    }

    static async postTask(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'desc', 'project_id', 'user_id', 'guid', 'create_time', 'assigned_user_id', 'due_date', 'priority_id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.saveTask(req.body);
        return res.status(200).json({status: "success", data: value});
    }

    static async getTaskByGUID(req, res) {
        const validRequest = assertObjectHas(req.params, 'guid');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getTaskByGUID(req.params.guid);

        if(!value) {
            return res.status(404).json({status: "failure", reason: "No such task"})
        }
        return res.status(200).json({status: "success", data: value});
    }

    static async getOwnedTasksForUser(req, res) {
        const value = await db.getOwnedTasksForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getAllTasksForUser(req, res) {
        const value = await db.getAllTasksForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getAssignedTasksForUser(req, res) {
        const value = await db.getAssignedTasksForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async updateTask(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'desc', 'project_id', 'user_id', 'guid', 'create_time', 'assigned_user_id', 'due_date', 'priority_id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }
        const value = await db.updateTask(req.body);
        return res.status(200).json({status: "success", data: value});
    }

    static async getTaskById(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getTaskById(req.params.id);

        if(!value) {
            return res.status(404).json({status: 'failure', reason: "No such task"})
        }
        return res.status(200).json({status: "success", data: value});
    }

    static async removeTask(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const task = await db.getTaskById(req.params.id);

        if(!task){
            return res.status(404).json({status: "failure", reason: "No such task"})
        }

        if(task.status_id >= 3){
            return res.status(403).json({status: "failure", reason: "Cannot remove a complete task"})
        }

        const value = await db.removeTask(task);
        return res.status(200).json({status: "success", data: value});
    }

    static async setTaskStatus(req, res) {
        const validRequest = assertObjectHas(req.params, 'id', 'statusID');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const task = await db.getTaskById(req.params.id);

        if(!task){
            return res.status(404).json({status: "failure", reason: "No such task"})
        }
        const value = await db.setTaskStatus(task, req.user, req.params.statusID);
        return res.status(200).json({status: "success", data: value});
    }

    static async getProjectsForUser(req, res) {
        const value = await db.getProjectsForUser(req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getProjectByGUID(req, res) {
        const validRequest = assertObjectHas(req.params, 'guid');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getProjectByGUID(req.params.guid);

        if(!value) {
            return res.status(404).json({status: "failure", reason: "No such project"})
        }
        return res.status(200).json({status: "success", data: value});
    }

    static async getProjectByID(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.getProjectByInternalId(req.params.id);

        if(!value) {
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        return res.status(200).json({status: "success", data: value});
    }

    static async saveNewProjectWithUser(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'create_time', 'guid', 'user_id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.saveNewProjectWithUser(req.body, req.user);
        return res.status(200).json({status: "success", data: value});
    }

    static async getUsersWithAccessToProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.id);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.getUsersWithAccessToProject(project);
        return res.status(200).json({status: "success", data: value});
    }

    static async addUserToProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.id);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.addUserToProject(req.user, project);
        return res.status(200).json({status: "success", data: value});
    }

    static async removeUserFromProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'userID');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const user = await db.getUserById(req.params.userID);
        const project = await db.getProjectByInternalId(req.params.id);

        if(!user){
            return res.status(404).json({status: "failure", reason: "No such user"})
        }

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.removeUserFromProject(user, project);
        return res.status(200).json({status: "success", data: value});
    }

    static async getTasksFromProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.id);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.getTasksFromProject(project);
        return res.status(200).json({status: "success", data: value});
    }

    static async deleteProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.id);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.deleteProject(project);
        return res.status(200).json({status: "success", data: value});
    }

    static async updateProject(req, res) {
        const validRequest = assertObjectHas(req.body, 'name', 'owner_id', 'project_id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.updateProject(req.body);
        return res.status(200).json({status: "success", data: value});
    }

    static async createInviteForProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'id');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.id);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const invite = await db.createInviteForProject(project);

        return res.status(200).json({status: "success", data: invite});
    }

    static async getProjectFromInvite(req, res) {
        const validRequest = assertObjectHas(req.params, 'invite');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectFromInvite(req.params.invite);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        return res.status(200).json({status: "success", data: project});
    }

    static async removeInviteToken(req, res) {
        const validRequest = assertObjectHas(req.params, 'invite');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.removeInviteToken(req.params.invite);
        return res.status(200).json({status: "success", data: value});
    }

    static async getWebhookTypes(req, res) {
        const value = await db.getWebhookTypes();
        return res.status(200).json({status: "success", data: value});
    }

    static async getWebhookForProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'projectID');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.projectID);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }

        const value = await db.getWebhookForProject(project);
        return res.status(200).json({status: "success", data: value});
    }

    static async setWebhook(req, res) {
        const validRequest = assertObjectHas(req.body, 'project_id', 'webhook_destination_id', 'webhook_location');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const value = await db.setWebhook(req.body);
        return res.status(200).json({status: "success", data: value});
    }

    static async deleteWebhookForProject(req, res) {
        const validRequest = assertObjectHas(req.params, 'projectID');
        if (!validRequest) {
            return res.status(400).json({status: "failure", reason: "Bad Request"})
        }

        const project = await db.getProjectByInternalId(req.params.projectID);

        if(!project){
            return res.status(404).json({status: "failure", reason: "No such project"})
        }
        const value = await db.deleteWebhookForProject(project);
        return res.status(200).json({status: "success", data: value});
    }

    static async getStatus(req, res) {
        const value = await db.getStatus();
        return res.status(200).json({status: "success", data: value});
    }

    static async getPriorities(req, res) {
        const value = await db.getPriorities();
        return res.status(200).json({status: "success", data: value});
    }
}

module.exports = InternalController;