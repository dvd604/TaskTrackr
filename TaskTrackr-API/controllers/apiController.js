const db = require("../config/data/db-direct");
const projectUtil = require("../util/projectUtil");
const taskUtil = require("../util/taskUtil");
const webhookUtil = require("../util/webhookUtil");

/**
 * Utility function to convert internal IDs to GUIDs and to then strip sensitive information
 * @param obj - Any TaskTrackr object
 * @returns {Promise<any>} A sanitized and safe TaskTrackr API Object
 */
async function sanitiseIds(obj) {
    if (obj.project_id)
        obj.project_id = (await db.getProjectByInternalId(obj.project_id)).guid;

    if (obj.user_id)
        obj.user_id = (await db.getUserById(obj.user_id)).guid;

    if (obj.task_id)
        obj.task_id = (await db.getTaskById(obj.task_id)).guid;

    if (obj.assigned_user_id)
        obj.assigned_user_id = (await db.getUserById(obj.assigned_user_id)).guid;

    if (obj.owner_id)
        obj.owner_id = (await db.getUserById(obj.owner_id)).guid;

    delete obj.guid;
    delete obj.password;
    delete obj.otp_secret;
}

class APIController {

    static async getInvite(req, res) {
        const {project_guid} = req.query;

        if(!project_guid){
            res.status(400).json({status: "fail", reason: "No project GUID supplied"});
            return;
        }

        const project = await db.getProjectByGUID(project_guid);

        if(project.owner_id !== req.user.user_id){
            res.status(403).json({status: "fail", reason: "Cannot create an invite for a project you do not own"});
            return;
        }


        const token = await db.createInviteForProject(project);

        res.json({status: "success", token: token});
    }

    static async acceptInvite(req, res) {
        const {project_guid, invite_token} = req.query;

        if (!project_guid) {
            res.status(400).json({status: "fail", reason: "No project GUID supplied"});
            return;
        }

        const project = await db.getProjectByGUID(project_guid);

        if(!project){
            res.status(404).json({status: "fail", reason: "Invalid project GUID supplied"});
            return;
        }

        const projectFromInvite = await db.getProjectFromInvite(invite_token);

        if(!projectFromInvite || projectFromInvite.project_id !== project.project_id){
            res.status(404).json({status: "fail", reason: "Invalid Project GUID / Invite Token Pair"});
            return;
        }

        await db.addUserToProject(req.user, project);
        await db.removeInviteToken(invite_token);
        res.json({status: "success"});
    }

    static async updateProject(req, res) {
        const {project_guid, name} = req.body;

        if (!project_guid) {
            res.status(400).json({status: "fail", reason: "No project GUID supplied"});
            return;
        }

        const project = await db.getProjectByGUID(project_guid);

        if (!project) {
            res.status(404).json({status: "fail", reason: "Invalid Project GUID supplied"});
            return;
        }

        if(project.owner_id !== req.user.user_id){
            res.status(403).json({status: "fail", reason: "Cannot edit a project you do not own"});
        }

        if (!name) {
            res.status(400).json({status: "fail", reason: "No Project Name supplied"});
            return;
        }

        if (name.length < 3) {
            res.status(400).json({status: "fail", reason: "Invalid Project Name supplied"});
            return;
        }

        project.name = name;

        await db.updateProject(project);
        res.json({status: "success"});
    }

    static async getTasks(req, res) {
        let tasks = undefined;
        if (req.query.project) {
            const project = await db.getProjectByGUID(req.query.project);
            tasks = await db.getTasksFromProject(project);
        } else
            tasks = await db.getAllTasksForUser(req.user);


        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            await sanitiseIds(task);
        }

        res.json(tasks);
    }

    static async postTask(req, res) {
        let {name, desc, project_guid, user_guid, due_date, priority_id} = req.body;

        if (!name) {
            res.status(400).json({status: "fail", reason: "No task name supplied"});
            return;
        }

        if (!due_date) {
            res.status(400).json({status: "fail", reason: "No due date supplied"});
            return;
        }

        if (!priority_id) {
            res.status(400).json({status: "fail", reason: "No priority ID supplied"});
            return;
        }

        if(user_guid && !project_guid){
            res.status(400).json({status: "fail", reason: "Can't assign a project-less task to another user"});
            return;
        }

        if (!desc) desc = null;

        let projectId = null;
        let project = undefined;
        let userId = req.user.user_id;
        if (project_guid && project_guid !== "null") {
            project = await db.getProjectByGUID(project_guid);
            if (project === undefined) {
                res.status(404).json({status: "fail", reason: "Invalid Project GUID"});
                return;
            }

            if (!await projectUtil.hasUserAccessToProject(req.user, project)) {
                res.status(403).json({status: "fail", reason: "Cannot add to project with no access to it"});
                return;
            }
            projectId = project.project_id;

            if (user_guid && user_guid !== "null") {
                const assignedUser = await db.getUserByGUID(user_guid);
                if (assignedUser === undefined) {
                    res.status(404).json({status: "fail", reason: "Invalid User GUID"});
                    return;
                }

                if (!await projectUtil.hasUserAccessToProject(assignedUser, project)) {
                    res.status(403).json({status: "fail", reason: "Cannot add to project with no access to it"});
                    return;
                }
                userId = assignedUser.user_id;
            }
        }

        let dueTime = undefined;

        try {
            dueTime = Math.floor(new Date(due_date).getTime() / 1000);
        } catch {
            res.status(400).json({status: "fail", reason: "Invalid due date supplied"});
            return;
        }

        let task = {
            name: name,
            desc: desc,
            project_id: projectId,
            user_id: req.user.user_id,
            status_id: 1,
            assigned_user_id: userId,
            due_date: dueTime,
            priority_id: priority_id
        };

        task = taskUtil.setupNewTask(task);

        await db.saveTask(task);
        await webhookUtil.doWebhook(req);
        res.status(201).json({status: "success", id: task.guid});
    }

    static async patchTask(req, res) {
        const {task_guid, name, desc, project_guid, user_guid, due_date, priority_id} = req.body;
        let user = undefined;
        let project = undefined;

        if(Object.keys(req.body).length > 2){
            res.status(400).json({status: "fail",
                reason: "PATCH can only take GUID and one argument from name, desc, project_guid, user_guid, due_date, priority_id"});
            return;
        }

        if (!task_guid) {
            res.status(400).json({status: "fail", reason: "Task GUID not supplied"});
            return;
        }

        const task = await db.getTaskFromGUID(task_guid);

        if (!task) {
            res.status(404).json({status: "fail", reason: "Invalid Task ID"});
            return;
        }

        if(task.user_id !== req.user.user_id) {
            res.status(403).json({status: "fail", reason: "Cannot edit a task you do not own"});
            return;
        }

        if (!user) user = null;
        if (!project) project = null;

        if (user_guid)
            user = await db.getUserByGUID(user_guid);

        if (project_guid)
            project = await db.getProjectByGUID(project_guid);

        let dueTime = undefined;

        try {
            dueTime = Math.floor(new Date(due_date).getTime() / 1000);
        } catch {
            res.json({status: "fail", reason: "Failed to read due date"});
            return;
        }

        if(task.name !== name) task.name = name;
        if(task.desc !== desc) task.desc = desc;
        if(user && task.assigned_user_id !== user.user_id) task.assigned_user_id = user.user_id;
        if(project && task.project_id !== project.project_id) task.project_id = project.project_id;
        if(dueTime !== task.due_date) task.due_date = dueTime;
        if(task.priority_id !== priority_id) task.priority_id = priority_id;

        await db.updateTask(task);
        res.json({status: "success"});
    }

    static async updateTask(req, res) {
        const {task_guid, name, desc, project_guid, user_guid, due_date, priority_id} = req.body;
        let user = undefined;
        let project = undefined;

        if (!task_guid || !name || !desc || !due_date || !priority_id) {
            res.status(400).json({status: "fail", reason: "Missing data for action"});
            return;
        }

        if (user_guid)
            user = await db.getUserByGUID(user_guid);

        if (project_guid)
            project = await db.getProjectByGUID(project_guid);

        const task = await db.getTaskFromGUID(task_guid);

        if (!task) {
            res.status(404).json({status: "fail", reason: "Invalid Task ID"});
            return;
        }

        if(task.user_id !== req.user.user_id) {
            res.status(403).json({status: "fail", reason: "Cannot edit a task you do not own"});
            return;
        }

        if (!user) user = null;
        if (!project) project = null;

        task.name = name;
        task.desc = desc;

        let dueTime = undefined;

        try {
            dueTime = Math.floor(new Date(due_date).getTime() / 1000);
        } catch {
            res.json({status: "fail", reason: "Failed to read due date"});
            return;
        }

        task.due_date = dueTime;
        task.priority_id = priority_id;

        if (project !== null && user !== null) {
            task.project_id = project.project_id;
            task.assigned_user_id = user.user_id;

            const allowedUsers = await db.getUsersWithAccessToProject(project);
            if (allowedUsers.find((fUser) => {
                return fUser.user_id === user.user_id
            })) {
                await db.updateTask(task);
                res.json({status: "success"});
                return;
            } else {
                res.status(403).json({
                    status: "fail",
                    reason: "Can't assign a Task to a User not in the Task Project"
                });
                return;
            }
        }

        task.project_id = null;
        task.assigned_user_id = req.user.user_id;
        await db.updateTask(task);
        res.json({status: "success"});
    }

    static async deleteTask(req, res) {
        const {guid} = req.body;

        if (!guid) {
            res.status(400).json({status: "fail", reason: "No Task ID Supplied"});
            return;
        }

        const task = await db.getTaskByGUID(guid);

        if (!task) {
            res.status(404).json({status: "fail", reason: "Invalid Task ID"});
            return;
        }

        if (task.user_id !== req.user.user_id) {
            res.status(400).json({status: "fail", reason: "Can't delete a task you don't own"});
            return;
        }

        if (task.status_id >= 3) {
            res.status(403).json({status: "fail", reason: "Can't delete a complete task"});
            return;
        }

        await db.removeTask(task);
        //Since we've just deleted our task, we can't get the task data from the DB for the webhook
        // ... We'll just pass the task to the webhook handler - this isn't clean or pretty,
        // but I'd rather do this and make sure the task has been deleted before announcing it
        req.task = task;
        await webhookUtil.doWebhook(req);
        res.json({status: "success"});
    }

    static async getProjects(req, res) {
        const projects = await db.getProjectsForUser(req.user);

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            await sanitiseIds(project);
        }

        res.json(projects);
    }

    static async getUser(req, res) {
        if (!req.query.user || req.query.user === req.user.guid) {
            const user = structuredClone(req.user);
            await sanitiseIds(user);
            res.json(user);
            return;
        }

        const user = await db.getUserByGUID(req.query.user);
        res.json({name: `${user.name} (${user.username})`});
    }

    static async getStatuses(req, res) {
        const status = await db.getStatus()

        res.json(status);
    }

    static async getPriority(req, res) {
        const status = await db.getPriorities();
        res.json(status);
    }

    static async postProject(req, res) {
        const project = req.body;
        project.owner_id = req.user.user_id;
        projectUtil.setupNewProject(project);

        console.log(project);

        await db.saveNewProjectWithUser(project, req.user);
        await sanitiseIds(project);
        res.status(201).json({status: "success", id: project.guid});
    }

    static async deleteProject(req, res) {
        if (!req.body) {
            res.status(400).json({status: "fail", reason: "No project ID supplied"});
            return;
        }

        const {project_id} = req.body;

        if (!project_id) {
            res.status(400).json({status: "fail", reason: "No project ID supplied"});
            return;
        }

        const project = await db.getProjectByGUID(project_id);

        if (!project) {
            res.status(404).json({status: "fail", reason: "Invalid project ID supplied"});
            return;
        }

        if (project.owner_id !== req.user.user_id) {
            res.status(403).json({status: "fail", reason: "Insufficient ownership"});
            return;
        }

        await db.deleteProject(project);
        res.json({status: "success"});
    }

}

module.exports = APIController;
