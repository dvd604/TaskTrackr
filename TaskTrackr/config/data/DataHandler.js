/**
 * Class representing a wrapper around a given Database access system.
 * Cannot be instantiated itself, as it is an abstract class.
 * DataHandlers may, but are not obligated to, provide sanity checks before performing database operations.
 * We recommend any such required checks be carried out before the database is changed - this ensures compatibility between
 * DataHandlers that do perform checks and those which don't.
 *
 * To ensure forwards compatibility we also include the Get and Set Context functions, which allow DataHandlers that require
 * authentication to pass this from the calling method to the destination
 * @type {DataHandler}
 * @class DataHandler
 */
module.exports = class DataHandler {

    static context = {};

    static getContext(){
        return this.context;
    };

    static setContext(context) {
        this.context = context;
    }

    constructor() {
        if (this.constructor === DataHandler) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    static async verifyCredentials(email, password){
        throw new Error("Method not implemented.");
    }

    /**
     * Deletes specified Task
     * @param {task} task - The task to remove
     * @returns {Promise<any>} Raw result set from database
     */
    static async removeTask(task){
        throw new Error("Method not implemented.");
    }

    /**
     * Sets the OTP secret for the specified user
     * @param {user} user - The user to set the OTP secret for
     * @param {string} otp - The OTP secret to set
     * @returns {Promise<any>} Raw result set from database
     */
    static async setUserOTPSecret(user, otp){
        throw new Error("Method not implemented.");
    }

    /**
     * Updates the specified user's information
     * @param {user} user - The user object to update
     * @returns {Promise<any>} Raw result set from database
     */
    static async updateUser(user) {
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a task by its ID
     * @param {number} id - The task ID to retrieve
     * @returns {Promise<task>} The task object corresponding to the provided ID
     */
    static async getTaskById(id){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the logs for a specific date
     * @param {Date} date - The date for which logs are to be fetched
     * @returns {Promise<any>} Raw log entries from the specified date
     */
    static async getTaskLogsForDate(date){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves status updates for a specific user
     * @param {user} user - The user to retrieve status updates for
     * @returns {Promise<any>} Status updates for the specified user
     */
    static async getStatusUpdatesForUser(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Updates the status of a task
     * @param {task} task - The task to update
     * @param {string} status - The new status to set for the task
     * @returns {Promise<any>} Raw result set from database
     */
    static async setTaskStatus(task, status){
        throw new Error("Method not implemented.");
    }

    /**
     * Deletes the webhook associated with a specific project
     * @param {project} project - The project to delete the webhook for
     * @returns {Promise<any>} Raw result set from database
     */
    static async deleteWebhookForProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Updates the specified project details
     * @param {project} project - The project to update
     * @returns {Promise<any>} Raw result set from database
     */
    static async updateProject(project) {
        throw new Error("Method not implemented.");
    }

    /**
     * Saves a webhook for a project
     * @param {webhook} webhook - The webhook to save
     * @returns {Promise<any>} Raw result set from database
     */
    static async setWebhook(webhook){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the webhook associated with a project
     * @param {project} project - The project to retrieve the webhook for
     * @returns {Promise<webhook>} The webhook associated with the project
     */
    static async getWebhookForProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all available webhook types
     * @returns {Promise<Array<string>>} List of available webhook types
     */
    static async getWebhookTypes(){
        throw new Error("Method not implemented.");
    }

    /**
     * Removes an invite token
     * @param {string} inviteToken - The invite token to remove
     * @returns {Promise<any>} Raw result set from database
     */
    static async removeInviteToken(inviteToken){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the project associated with a specific invite key
     * @param {string} invite_key - The invite key to look up
     * @returns {Promise<project>} The project associated with the invite key
     */
    static async getProjectFromInvite(invite_key) {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates an invite for a project
     * @param {project} project - The project to create an invite for
     * @returns {Promise<any>} Raw result set from database
     */
    static async createInviteForProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Removes a user from a project
     * @param {user} user - The user to remove
     * @param {project} project - The project to remove the user from
     * @returns {Promise<any>} Raw result set from database
     */
    static async removeUserFromProject(user, project){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all available task priorities
     * @returns {Promise<Array<string>>} List of task priorities
     */
    static async getPriorities(){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the user associated with a specific token
     * @param {string} token - The token to look up the associated user for
     * @returns {Promise<user>} The user associated with the provided token
     */
    static async getUserFromToken(token){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all tokens associated with a specific user
     * @param {user} user - The user to retrieve tokens for
     * @returns {Promise<Array<string>>} List of tokens associated with the user
     */
    static async getTokensForUser(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a specific token by its name for a given user
     * @param {string} token_name - The name of the token to retrieve
     * @param {user} user - The user to retrieve the token for
     * @returns {Promise<string>} The token associated with the provided name and user
     */
    static async getTokenByName(token_name, user){
        throw new Error("Method not implemented.");
    }

    /**
     * Deletes a specific token
     * @param {string} token - The token to delete
     * @returns {Promise<any>} Raw result set from database after token deletion
     */
    static async deleteToken(token){
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a token for a specific user
     * @param {user} user - The user to create a token for
     * @returns {Promise<string>} The newly created token for the user
     */
    static async createToken(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Adds a user to a specific project
     * @param {user} user - The user to add to the project
     * @param {project} project - The project to add the user to
     * @returns {Promise<any>} Raw result set from database after adding the user to the project
     */
    static async addUserToProject(user, project){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a user by their GUID
     * @param {string} guid - The GUID of the user
     * @returns {Promise<user>} The user associated with the provided GUID
     */
    static async getUserByGUID(guid){
        throw new Error("Method not implemented.");
    }

    /**
     * Updates a task's details
     * @param {task} task - The task to update
     * @returns {Promise<any>} Raw result set from database
     */
    static async updateTask(task){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a task by its GUID
     * @param {string} guid - The GUID of the task to retrieve
     * @returns {Promise<task>} The task object corresponding to the provided GUID
     */
    static async getTaskFromGUID(guid){
        throw new Error("Method not implemented.");
    }

    /**
     * Deletes a project
     * @param {project} project - The project to delete
     * @returns {Promise<any>} Raw result set from database
     */
    static async deleteProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all tasks associated with a project
     * @param {project} project - The project to retrieve tasks for
     * @returns {Promise<Array<task>>} List of tasks associated with the project
     */
    static async getTasksFromProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all users with access to a specific project
     * @param {project} project - The project to check access for
     * @returns {Promise<Array<user>>} List of users with access to the project
     */
    static async getUsersWithAccessToProject(project){
        throw new Error("Method not implemented.");
    }

    /**
     * Saves a new project along with the user associated with it
     * @param {project} project - The project to save
     * @param {user} user - The user associated with the project
     * @returns {Promise<any>} Raw result set from database
     */
    static async saveNewProjectWithUser(project, user){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the list of possible task statuses
     * @returns {Promise<Array<status>>} List of possible Task statuses
     */
    static async getStatus(){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a project by its internal ID
     * @param {string} id - The internal ID of the project
     * @returns {Promise<project>} The project associated with the provided internal ID
     */
    static async getProjectByInternalId(id){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a project by its GUID
     * @param {string} guid - The GUID of the project to retrieve
     * @returns {Promise<project>} The project associated with the provided GUID
     */
    static async getProjectByGUID(guid){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all projects associated with a user
     * @param {user} user - The user to retrieve projects for
     * @returns {Promise<Array<project>>} List of projects associated with the user
     */
    static async getProjectsForUser(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves all tasks associated with a user
     * @param {user} user - The user to retrieve tasks for
     * @returns {Promise<Array<task>>} List of tasks associated with the user
     */
    static async getAllTasksForUser(user) {
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves the assigned tasks for a user, or undefined if no tasks exist
     * @param {user} user - The user to retrieve assigned tasks for
     * @returns {Promise<Array<task>>} List of tasks assigned to the user
     */
    static async getAssignedTasksForUser(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves owned tasks for a specific user, or undefined if no tasks exist
     * @param {user} user - The user to retrieve tasks for
     * @returns {Promise<Array<task>>} List of tasks associated with the user
     */
    static async getTasksForUser(user){
        throw new Error("Method not implemented.");
    }

    /**
     * Saves a task
     * @param {task} task - The task to save
     * @returns {Promise<any>} Raw result set from database
     */
    static async saveTask(task){
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a user by their email
     * @param {string} email - The email address to look up
     * @returns {Promise<user>} The user associated with the provided email
     */
    static async getUserByEmail(email) {
        throw new Error("Method not implemented.");
    }

    /**
     * Retrieves a user by their ID
     * @param {string} id - The ID of the user to retrieve
     * @returns {Promise<user>} The user associated with the provided ID
     */
    static async getUserById(id) {
        throw new Error("Method not implemented.");
    }

    /**
     * Saves a user object
     * @param {user} user - The user object to save
     * @returns {Promise<any>} Raw result set from database
     */
    static async saveUser(user) {
        throw new Error("Method not implemented.");
    }

}