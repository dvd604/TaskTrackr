const {v4: uuidv4} = require("uuid");
const db = require("../config/data/db-direct");

/**
 * Takes an incomplete project object and sets the creation time and GUID
 * @param project - The project to complete
 * @returns {project} A complete project object
 */
function setupNewProject(project){
    if(project.guid === undefined || project.create_time === undefined){
        project.guid = uuidv4();
        project.create_time = Math.floor(Date.now() / 1000)
    }

    return project;
}

/**
 * Utility function to check if a user has access to a given project
 * @param user - The user to check
 * @param project - The project to check
 * @returns {Promise<boolean>} - true if user has access, false otherwise
 */
async function hasUserAccessToProject(user, project){
    const users =  await db.getUsersWithAccessToProject(project);

    return users.find(u => u.username === user.username) !== undefined;
}

module.exports = {setupNewProject : setupNewProject, hasUserAccessToProject : hasUserAccessToProject};