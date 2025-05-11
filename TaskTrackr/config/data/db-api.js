/**
 * DataHandler for indirect access to our data via TaskTrackr-api
 * Provides no validation or safety on deletion, so this should be performed before database calls
 * @class {DBDirect}
 * @extends DataHandler
 */
const DataHandler = require("./DataHandler");
const log = require("../../util/logUtil");

//Quick init to make sure we have enough data to boot

const api_base = process.env.API_BASE;

if (!api_base) {
    log("API", "DB-API failed to boot: No API_BASE given!");
    return;
}

/**
 * Utility function to make HTTP GET requests to TaskTrackr API servers
 * @param url URL to GET
 * @param token Auth token for API server
 * @returns {Promise<any>} The JSON response
 */
async function get(url, token) {
    try {
        const result = (await fetch(url, {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`}
        })).json();

        if(result.status === 'Unauthorized') {
            log("API", "API Return Unauthorized!");
            return;
        }
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/**
 * Utility function to make HTTP POST requests to TaskTrackr API servers
 * @param url URL to POST
 * @param token Auth token for API server
 * @param body The body to send
 * @returns {Promise<any>} The JSON response
 */
async function post(url, token, body) {
    try {
        return (await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })).json();
    } catch (err) {
        throw err;
    }
}

/**
 * Utility function to make HTTP PUT requests to TaskTrackr API servers
 * @param url URL to PUT
 * @param token Auth token for API server
 * @param body The body to send
 * @returns {Promise<any>} The JSON response
 */
async function put(url, token, body) {
    try {
        return (await fetch(url, {
            method: "PUT",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })).json();
    } catch (err) {
        throw err;
    }
}

/**
 * Utility function to make HTTP PATCH requests to TaskTrackr API servers
 * @param url URL to PATCH
 * @param token Auth token for API server
 * @param body The body to send
 * @returns {Promise<any>} The JSON response
 */
async function patch(url, token, body) {
    try {
        return (await fetch(url, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })).json();
    } catch (err) {
        throw err;
    }
}

/**
 * Utility function to make HTTP DELETE requests to TaskTrackr API servers
 * @param url URL to DELETE
 * @param token Auth token for API server
 * @param body The body to send
 * @returns {Promise<any>} The JSON response
 */
async function del(url, token, body) {
    try {
        return (await fetch(url, {
            method: "DELETE",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })).json();
    } catch (err) {
        throw err;
    }
}

module.exports = class DBApi extends DataHandler {

    static async verifyCredentials(email, password){
        return await post(`${api_base}/int/auth`, 0, {email: email, password: password});
    }

    static async removeTask(task) {
        return (await del(`${api_base}/int/task/${task.task_id}`, this.getContext().authKey)).data;
    }

    static async setUserOTPSecret(user, otp) {
        return (await post(`${api_base}/int/user/otp/set`, this.getContext().authKey, {secret: otp})).data;
    }

    static async getEmailCount(email) {
        return (await get(`${api_base}/int/email/${email}`, this.getContext().authKey)).data;
    }

    static async getTaskById(id) {
        return (await get(`${api_base}/int/task/${id}`, this.getContext().authKey)).data;
    }

    static async getTaskLogsForDate( date) {
        return (await get(`${api_base}/int/user/log/${date/1000}`, this.getContext().authKey)).data;
    }

    static async getStatusUpdatesForUser(user) {
        return (await get(`${api_base}/int/user/log`, this.getContext().authKey)).data;
    }

    static async setTaskStatus(task, status) {
        return (await post(`${api_base}/int/task/${task.task_id}/status/${status}`, this.getContext().authKey)).data;
    }

    static async deleteWebhookForProject(project) {
        return (await del(`${api_base}/int/webhook/project/${project.project_id}`, this.getContext().authKey)).data;
    }

    static async setWebhook(webhook) {
        return (await post(`${api_base}/int/webhook`, this.getContext().authKey, webhook)).data;
    }

    static async getWebhookForProject(project) {
        return (await get(`${api_base}/int/webhook/project/${project.project_id}`, this.getContext().authKey)).data;
    }

    static async getWebhookTypes() {
        return (await get(`${api_base}/int/webhook`, this.getContext().authKey)).data;
    }

    static async removeInviteToken(inviteToken) {
        return (await del(`${api_base}/int/project/invite/${inviteToken}`, this.getContext().authKey)).data;
    }

    static async getProjectFromInvite(invite_key) {
        return (await get(`${api_base}/int/project/invite/${invite_key}`, this.getContext().authKey)).data;
    }

    static async createInviteForProject(project) {
        return (await get(`${api_base}/int/project/${project.project_id}/invite/create`, this.getContext().authKey)).data;
    }

    static async removeUserFromProject(user, project) {
        return (await post(`${api_base}/int/project/${project.project_id}/users/remove/${user.user_id}`, this.getContext().authKey)).data;
    }

    static async getPriorities() {
        return (await get(`${api_base}/int/priorities`, this.getContext().authKey)).data;
    }

    static async getUserFromToken(token) {
        return (await get(`${api_base}/int/user/token/${tokenName}`, this.getContext().authKey)).data;
    }

    static async getTokenByName(token_name, user) {
        return (await get(`${api_base}/int/user/token/name/${token_name}`, this.getContext().authKey)).data;
    }

    static async getTokensForUser(user) {
        return (await get(`${api_base}/int/user/token`, this.getContext().authKey)).data;
    }

    static async deleteToken(token) {
        return (await del(`${api_base}/int/user/token/${tokenName}`, this.getContext().authKey));
    }

    static async createToken(user, tokenName) {
        return (await post(`${api_base}/int/user/token/add/${tokenName}`, this.getContext().authKey)).data;
    }

    static async addUserToProject(user, project) {
        return (await post(`${api_base}/int/project/${project.project_id}/users/add/`, this.getContext().authKey)).data;
    }

    static async getUserByGUID(guid) {
        return (await get(`${api_base}/int/user/guid/${guid}`, this.getContext().authKey)).data;
    }

    static async updateProject(project) {
        return (await put(`${api_base}/int/project/${project.project_id}`, this.getContext().authKey, project)).data;
    }

    static async updateTask(task) {
        return (await put(`${api_base}/int/task/${task.task_id}`, this.getContext().authKey, task)).data;
    }

    static async getTaskFromGUID(guid) {
        return (await get(`${api_base}/int/task/guid/${guid}`, this.getContext().authKey)).data;
    }

    static async deleteProject(project) {
        return (await del(`${api_base}/int/project/${project.project_id}`, this.getContext().authKey)).data;
    }

    static async getTasksFromProject(project) {
        return (await get(`${api_base}/int/project/${project.project_id}/tasks`, this.getContext().authKey)).data;
    }

    static async getUsersWithAccessToProject(project) {
        return (await get(`${api_base}/int/project/${project.project_id}/users`, this.getContext().authKey)).data;
    }

    static async saveNewProjectWithUser(project, user) {
        return (await post(`${api_base}/int/project`, this.getContext().authKey, project)).data;
    }

    static async getStatus() {
        return (await get(`${api_base}/int/status`, this.getContext().authKey)).data;
    }

    static async getProjectByInternalId(id) {
        return (await get(`${api_base}/int/project/${id}`, this.getContext().authKey)).data;
    }

    static async getProjectByGUID(guid) {
        return (await get(`${api_base}/int/project/guid/${guid}`, this.getContext().authKey)).data;
    }

    static async getProjectsForUser(user) {
        return (await get(`${api_base}/int/project`, this.getContext().authKey)).data;
    }

    static async getAssignedTasksForUser(user) {
        return (await get(`${api_base}/int/task/assigned/`, this.getContext().authKey)).data;
    }

    static async getAllTasksForUser(user) {
        return (await get(`${api_base}/int/task/all/`, this.getContext().authKey)).data;
    }

    static async getOwnedTasksForUser(user) {
        return (await get(`${api_base}/int/task/owned/`, this.getContext().authKey)).data;
    }

    static async saveTask(task) {
        return (await post(`${api_base}/int/task/`, this.getContext().authKey, task)).data;
    }

    static async getUserByEmail(email) {
        return (await get(`${api_base}/int/user/email/${email}`, this.getContext().authKey)).data;
    }

    static async getUserById(id) {
        return (await get(`${api_base}/int/user/id/${id}`, this.getContext().authKey)).data;
    }

    static async updateUser(user) {
        return (await put(`${api_base}/int/user/`, this.getContext().authKey, user)).data;
    }

    static async saveUser(user) {
        return (await post(`${api_base}/int/user/`, this.getContext().authKey, user));
    }

}