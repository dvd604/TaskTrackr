const db = require(`../config/data/${process.env.DB_METHOD}`);
const taskUtil = require("../util/taskUtil")
const projectUtil = require("../util/projectUtil");
const webhookUtil = require("../util/webhookUtil");

class TaskController {
    static async getRemove(req, res) {
        const {guid} = req.query;

        if(!guid){
            res.send("Invalid request");
            return;
        }

        const task = await db.getTaskFromGUID(guid);

        if(!task) {
            res.send("Invalid request");
            return;
        }

        if(task.user_id !== req.user.user_id){
            res.send("Invalid request");
            return;
        }

        if(task.status_id >= 3){
            res.send("Invalid request");
            return;
        }

        await db.removeTask(task);
        //Since we've just deleted our task, we can't get the task data from the DB for the webhook
        // ... We'll just pass the task to the webhook handler - this isn't clean or pretty,
        // but I'd rather do this and make sure the task has been deleted before announcing it
        req.task = task;
        await webhookUtil.doWebhook(req);

        res.redirect(`/task/list`);
    }

    static async getAdd(req, res) {
        const projects = await db.getProjectsForUser(req.user);
        const usersInProjects = await taskUtil.getDisplayNamesForProjects(projects);
        const priority = await db.getPriorities();

        res.render('task/modal/add', {title: "", projects: projects, users: usersInProjects, priority: priority})
    }

    static async postAdd(req, res) {
        let {name, desc, project_guid, user_guid, due_date, priority_id} = req.body;
        
        if (!name || !project_guid) {
            res.send("Invalid request");
            return;
        }

        if(!desc) desc = null;

        let projectId = null;
        let project = undefined;
        if (project_guid !== "null") {
            project = await db.getProjectByGUID(project_guid);
            if (project === undefined) {
                res.send("Invalid request");
                return;
            }

            if (!await projectUtil.hasUserAccessToProject(req.user, project)) {
                res.send("Invalid permissions");
                return;
            }
            projectId = project.project_id;
        }

        let userId = req.user.user_id;
        if (user_guid && user_guid !== "null") {
            const assignedUser = await db.getUserByGUID(user_guid);
            if (assignedUser === undefined) {
                res.send("Invalid request");
                return;
            }

            if (!await projectUtil.hasUserAccessToProject(assignedUser, project)) {
                res.send("Invalid permissions");
                return;
            }
            userId = assignedUser.user_id;
        }

        let dueTime = undefined;

        try {
            dueTime = Math.floor(new Date(due_date).getTime() / 1000);
        } catch {
            res.send("Invalid request");
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

        res.redirect('/task/list');
    }

    static async getList(req, res) {
        const projects = await db.getProjectsForUser(req.user);
        const status = await db.getStatus();
        const priority = await db.getPriorities();

        const getProject = function (task) {
            if (task.project_id === undefined || task.project_id === null) return {name: "No Project", guid:""};
            const project = projects.find((proj) => {
                return proj.project_id === task.project_id
            });
            if (project === undefined) return {name: "No Project", guid:""};
            return project;
        }

        const getStatus = function (statusCode) {
            const statusName = status.find(status => status.status_id === statusCode)
            if(!statusName) return "No Status";
            return statusName.name;
        }

        function getPriority(id){
            return priority.find(pr => {return pr.priority_id === id}).text;
        }

        let tasks = await db.getAllTasksForUser(req.user);

        for (let i = 0; i < tasks.length; i++) {
            tasks[i].ownerName = await taskUtil.getUserDisplayName(tasks[i].user_id);
            tasks[i].assignedName = await taskUtil.getUserDisplayName(tasks[i].assigned_user_id);
            tasks[i].statusButton = taskUtil.getStatusButton(tasks[i].status_id);
            tasks[i].statusColour = taskUtil.getStatusColour(tasks[i].status_id);
            tasks[i].priority = getPriority(tasks[i].priority_id);
            tasks[i].project = getProject(tasks[i]).name;
            tasks[i].project_guid = getProject(tasks[i]).guid;
            tasks[i].status = getStatus(tasks[i].status_id);
            tasks[i].nextStatus = getStatus(tasks[i].status_id+1);
            delete tasks[i].task_id;
            delete tasks[i].project_id;
            delete tasks[i].user_id;
            delete tasks[i].create_time;
            delete tasks[i].assigned_user_id;
        }

        res.render('task/list', {
            title: "Task List",
            priority: priority,
            tasks: tasks,
            status: status,
            username: `${req.user.name} (${req.user.username})`
        });
    }

    static async postInspect(req, res) {
        const {task_guid, name, desc, project_guid, user_guid, dueDate, priority_id} = req.body;
        let user = undefined;
        let project = undefined;

        if(!task_guid || !name || !dueDate || !priority_id) {
            res.send("Invalid request");
            return;
        }

        if(user_guid)
            user = await db.getUserByGUID(user_guid);

        if(project_guid)
            project = await db.getProjectByGUID(project_guid);

        const task = await db.getTaskFromGUID(task_guid);
        if(task.user_id !== req.user.user_id){
            res.send("Invalid request");
            return;
        }

        if (!task) {
            res.send("Invalid request");
            return;
        }

        if (!user) user = null;
        if (!project) project = null;

        task.name = name;
        task.desc = desc;

        let dueTime = undefined;

        try {
            dueTime = Math.floor(new Date(dueDate).getTime() / 1000);
        } catch {
            res.send("Invalid request");
            return;
        }

        task.due_date = dueTime;
        task.priority_id = priority_id;

        if (project !== null && user !== null) {
            task.project_id = project.project_id;
            task.assigned_user_id = user.user_id;

            const allowedUsers = await db.getUsersWithAccessToProject(project);
            if(allowedUsers.find((fUser) => {return fUser.user_id === user.user_id})){
                await db.updateTask(task);
                res.redirect('/task/list');
                return;
            } else {
                res.send("Invalid request");
                return;
            }
        }

        task.project_id = null;
        task.assigned_user_id = req.user.user_id;
        await db.updateTask(task);
        res.redirect('/task/list');
    }

    static async getInspect(req, res) {
        const guid = req.query.guid;
        if (guid === undefined) {
            res.send("Invalid task GUID");
            return;
        }

        const task = await db.getTaskFromGUID(guid);

        if (task === undefined) {
            res.send("Invalid task GUID");
            return;
        }

        const projects = await db.getProjectsForUser(req.user);
        const usersInProjects = await taskUtil.getDisplayNamesForProjects(projects, true);
        const priority = await db.getPriorities();
        const canEdit = task.user_id === req.user.user_id;


        res.render('task/modal/inspect', {title: "", task: task, projects: projects, users: usersInProjects, priority: priority, canEdit: canEdit})
    }

    static async postStatusSet(req, res) {
        const {guid, status} = req.body;

        if (guid === undefined || status === undefined) {
            res.status(500).send("Invalid request");
            return;
        }

        const task = await db.getTaskFromGUID(guid);

        if (!task || !taskUtil.checkUserHasPermissionsForTask(req.user, task)) {
            res.status(500).send("Invalid request");
            return;
        }

        await db.setTaskStatus(task, status);
        await webhookUtil.doWebhook(req);
        res.send({status: "okay"});
    }
}

module.exports = TaskController;