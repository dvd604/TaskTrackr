const {v4: uuidv4} = require("uuid");
const db = require('../config/data/db-direct');


/**
 * Utility function to check if a user has access to a given task
 * @param user - The user to check
 * @param task - The task to check
 * @returns {boolean} - true if the user is either the task owner or assigned user, false otherwise
 */
function checkUserHasPermissionsForTask(user, task){
    if(user.user_id === task.user_id) return true;
    return user.user_id === task.assigned_user_id;
}

/**
 * Takes a given user ID and creates a display string for the user in the format `display name (Username)`
 * @param user_id - The user ID
 * @returns {Promise<string>} - The display string
 */
async function getUserDisplayName(user_id){
    const user = await db.getUserById(user_id);
    return `${user.name} (${user.username})`;
}

/**
 * Takes an incomplete task object and sets the creation time and GUID
 * @param task - The task to complete
 * @returns {task} A complete task object
 */
function setupNewTask(task){
    if(task.guid === undefined || task.create_time === undefined){
        task.guid = uuidv4();
        task.create_time = Math.floor(Date.now() / 1000)
    }

    return task;
}

/**
 * Takes a status id and returns a html string for the button which corresponds to it
 * @param statusCode - A TaskTrackr status ID
 * @returns {undefined|string} - HTML string for the appropriate button to display
 */
function getStatusButton (statusCode) {
    switch (statusCode) {
        case 1: {
            return '<i class="fa-solid fa-play\"></i>';
        }
        case 2: {
            return '<i class="fa-solid fa-check"></i>'
        }
        case 3: {
            return '<i class="fa-solid fa-box-archive"></i>';
        }
        case 4: {
            return undefined;
        }
    }
}

/**
 * Takes a status id and returns a BootStrap colour class to display
 * @param statusCode - A TaskTrackr status ID
 * @returns {undefined|string} - BootStrap colour class to display
 */
function getStatusColour (statusCode){
    switch (statusCode) {
        case 1: {
            return 'warning';
        }
        case 2: {
            return 'success'
        }
        case 3: {
            return 'dark';
        }
        case 4: {
            return undefined;
        }
    }
}

/**
 * Utility function to retreive a list of display names for a list of projects
 * @param projects - A list of projects to generate display names for
 * @returns {Promise<?>} - A map of arrays - the arrays contain user GUIDs, display strings and internal ids
 */
async function getDisplayNamesForProjects(projects){
    const usersInProjects = {};

    for(const project of projects) {
        usersInProjects[project.name] = [];
        const users = await db.getUsersWithAccessToProject(project);
        for(const user of users){
            usersInProjects[project.name].push({guid: user.guid, name: `${user.name} (${user.username})`, id: user.user_id});
        }
    }

    return usersInProjects;
}

module.exports = {
    setupNewTask: setupNewTask,
    getStatusColour: getStatusColour,
    getStatusButton: getStatusButton,
    getUserDisplayName:getUserDisplayName,
    checkUserHasPermissionsForTask: checkUserHasPermissionsForTask,
    getDisplayNamesForProjects: getDisplayNamesForProjects}