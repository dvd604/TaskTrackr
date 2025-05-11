const db = require(`../config/data/${process.env.DB_METHOD}`);
const projectUtil = require("../util/projectUtil")

class ProjectController {

    static async getList(req, res) {
        const projects = await db.getProjectsForUser(req.user);

        for (let i = 0; i < projects.length; i++) {
            projects[i].users = (await db.getUsersWithAccessToProject(projects[i])).length;
        }

        for (let i = 0; i < projects.length; i++) {
            const tasks = await db.getTasksFromProject(projects[i]);
            projects[i].tasksTotal = tasks.length;
            projects[i].tasksComplete = tasks.filter(task => task.status_id >= 3).length;
        }

        res.render('project/list', {title: "Project List", projects: projects});
    }

    static getAdd(req, res) {
        res.render('project/modal/add', {title: ""});
    }

    static async getInspect(req, res) {
        const {guid} = req.query;

        if (!guid) {
            res.send("Invalid request");
            return;
        }

        const project = await db.getProjectByGUID(guid);
        const hasPerms = await projectUtil.hasUserAccessToProject(req.user, project);

        if (!project || !hasPerms) {
            res.send("Invalid request");
            return;
        }

        const users = await db.getUsersWithAccessToProject(project);
        const webhookData = await db.getWebhookForProject(project);
        const webhookTypes = await db.getWebhookTypes();
        console.log(webhookTypes);

        res.render('project/modal/inspect', {
            title: "",
            project: project,
            users: users,
            showUserDelete: (project.owner_id === req.user.user_id),
            webhook: webhookData,
            webhookTypes: webhookTypes
        });
    }

    static async getDelete(req, res) {
        const guid = req.query.guid;
        const project = await db.getProjectByGUID(guid);
        const tasks = await db.getTasksFromProject(project);

        if (project.owner_id !== req.user.user_id) {
            res.send("Invalid permissions");
            return;
        }

        await db.deleteProject(project);
        res.redirect('../list')
    }

    static async postAdd(req, res) {
        if (req.body.name.length > 2) {
            const data = projectUtil.setupNewProject(req.body);
            await db.saveNewProjectWithUser(data, req.user);
        }

        res.redirect('../list')
    }


    static async postUserRemove(req, res) {
        const {user_guid, project_guid} = req.body;

        if (!user_guid || !project_guid) {
            res.send("Invalid request");
            return;
        }

        const project = await db.getProjectByGUID(project_guid);
        const user = await db.getUserByGUID(user_guid);

        if (!project || !user) {
            res.send("Invalid request");
            return;
        }

        if (project.owner_id !== req.user.user_id) {
            res.send("Invalid request");
            return;
        }

        const hasPerms = await projectUtil.hasUserAccessToProject(req.user, project);

        if (!hasPerms) {
            res.send("Invalid request");
            return;
        }

        await db.removeUserFromProject(user, project);
        res.redirect('../list')
    }

    static async getUserInvite(req, res){
        const {project_guid, invite_token} = req.query;

        if (!project_guid) {
            res.send("Invalid invite");
            return;
        }

        const project = await db.getProjectByGUID(project_guid);

        if(!project){
            res.send("Invalid invite");
            return;
        }

        const projectFromInvite = await db.getProjectFromInvite(invite_token);

        if(!projectFromInvite || projectFromInvite.project_id !== project.project_id){
            res.send("Invalid invite");
            return;
        }

        await db.addUserToProject(req.user, project);
        await db.removeInviteToken(invite_token);
        res.redirect('../list')
    }

    static async getInviteCreate(req,res){
        const {project_guid} = req.query;

        if (!project_guid) {
            res.send("Invalid request");
            return;
        }

        const project = await db.getProjectByGUID(project_guid);

        if(!project){
            res.send("Invalid request");
            return;
        }

        if(req.user.user_id !== project.owner_id){
            res.send("Invalid request");
            return;
        }

        const inviteKey = await db.createInviteForProject(project);
        res.send({invite: inviteKey});
    }

    static async postInspect(req,res){
        const {project_guid, name, url, webhook_type} = req.body;
        const project = await db.getProjectByGUID(project_guid);

        if(!project){
            res.send("Invalid request");
            return;
        }

        if(name) {
            if(name.length < 3){
                res.send("Invalid request");
                return;
            }
            project.name = name;
        }

        if(url && webhook_type){
            const webhookData = {project_id : project.project_id,
                webhook_destination_id: webhook_type,
                webhook_location: url}

            await db.deleteWebhookForProject(project);
            await db.setWebhook(webhookData);
        }

        await db.updateProject(project);
        res.redirect('../../list');
    }
}

module.exports = ProjectController;