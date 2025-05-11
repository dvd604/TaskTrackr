const DataHandler = require("./DataHandler");
const db = require("../database");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

async function transact(transactionCallback) {
    let conn = undefined;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();
        const result = await transactionCallback(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw new Error('Database error: ' + error.message);
    } finally {
        if (conn) conn.release();
    }
}

/**
 * DataHandler for direct access to MySQL server
 * Provides no validation or safety on deletion, so this should be performed before database calls
 * @class {DBDirect}
 * @extends DataHandler
 */
module.exports = class DBDirect extends DataHandler {

    static async verifyUser(email, password){
        const user = await this.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }

    static async removeTask(task){
        return await transact(async conn => {
            const [res1] = await conn.execute('DELETE FROM task_status_log WHERE task_id = ?', [task.task_id]);
            const [res2] = await conn.execute('DELETE FROM task WHERE task_id = ?', [task.task_id]);

            return {res1, res2};
        });
    }

    static async setUserOTPSecret(user, otp) {
        try {
            const [result] = await db.execute('UPDATE user SET otp_secret = ? WHERE user_id = ?',
                [otp, user.user_id]);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getEmailCount(email) {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) as count FROM user WHERE email = ?',
                [email]);
            return rows[0].count;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTaskById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM task WHERE task_id = ?',
                [id]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTaskLogsForDate(user, date) {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 9999);

        try {
            const [rows] = await db.execute('SELECT * FROM task_status_log WHERE user_id = ? AND time > ? AND time < ?;',
                [user.user_id, Math.floor(start / 1000), Math.floor(end / 1000)])
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getStatusUpdatesForUser(user) {
        try {
            const [result] = await db.execute('SELECT * FROM task_status_log WHERE user_id = ?',
                [user.user_id]);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async setTaskStatus(task, user, status) {
        return await transact(async (conn) => {
            const [result] = await conn.query('UPDATE task SET `status_id` = ? WHERE `task_id` = ?',
                [status, task.task_id]);
            const [result2] = await conn.query('INSERT INTO task_status_log (task_id, user_id, status_id, time) VALUES (?,?,?,?)',
                [task.task_id, user.user_id, status, Math.floor(Date.now() / 1000)]);
            return {result, result2};
        });
    }

    static async deleteWebhookForProject(project) {
        try {
            const [result] = await db.execute('DELETE FROM project_webhook WHERE project_id = ?', [project.project_id]);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async setWebhook(webhook) {
        try {
            const [result] = await db.execute('INSERT INTO project_webhook (project_id, webhook_destination_id, webhook_location) VALUES (?,?,?)',
                [webhook.project_id, webhook.webhook_destination_id, webhook.webhook_location]);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getWebhookForProject(project) {
        try {
            const [rows] = await db.execute(
                'SELECT * from webhook_destination INNER JOIN project_webhook ON webhook_destination.webhook_destination_id = project_webhook.webhook_destination_id WHERE project_id = ?',
                [project.project_id]);

            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getWebhookTypes() {
        try {
            const [rows] = await db.execute(
                'SELECT * from webhook_destination',);
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async removeInviteToken(inviteToken) {
        try {
            const [result] = await db.execute('DELETE FROM project_invite WHERE invite_key = ?', [inviteToken]);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getProjectFromInvite(invite_key) {
        try {
            const [rows] = await db.execute(
                'SELECT project.* from project INNER JOIN project_invite on project.project_id = project_invite.project_id WHERE project_invite.invite_key = ?',
                [invite_key]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async createInviteForProject(project) {
        try {
            const token = crypto.randomBytes(10).toString('base64');

            const [result] = await db.execute(
                'INSERT INTO project_invite (project_id, invite_key) VALUES (?,?)',
                [project.project_id, token]
            )
            return token;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async removeUserFromProject(user, project) {
        return await transact(async (conn) => {
            const [result] = await conn.query('UPDATE task SET `assigned_user_id` = `user_id` WHERE `assigned_user_id` = ? AND `project_id` = ? AND NOT `user_id` = ?',
                [user.user_id, project.project_id, user.user_id]);
            const [result2] = await conn.query('UPDATE task SET `user_id` = `assigned_user_id` WHERE `user_id` = ? AND `project_id` = ? AND NOT `assigned_user_id` = ?',
                [user.user_id, project.project_id, user.user_id]);
            const [result3] = await conn.query('DELETE from user_project WHERE `user_id` = ? AND `project_id` = ?',
                [user.user_id, project.project_id]);
            return {result, result2, result3};
        });

        /*
        let conn = undefined;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();

            //This isn't intuitive, but:
            //If a user is kicked from a project, this aims to
            //Return tasks to their owners - i.e. remove our user as the assigned user
            //Force assigned users tasks to own tasks - i.e. set their user to own the task
            //Remove the link between the user and project

            const [result] = await conn.query('UPDATE task SET `assigned_user_id` = `user_id` WHERE `assigned_user_id` = ? AND `project_id` = ? AND NOT `user_id` = ?',
                [user.user_id, project.project_id, user.user_id]);
            const [result2] = await conn.query('UPDATE task SET `user_id` = `assigned_user_id` WHERE `user_id` = ? AND `project_id` = ? AND NOT `assigned_user_id` = ?',
                [user.user_id, project.project_id, user.user_id]);
            const [result3] = await conn.query('DELETE from user_project WHERE `user_id` = ? AND `project_id` = ?',
                [user.user_id, project.project_id]);
            await conn.commit();

            return {result, result2, result3};
        } catch (error) {
            await conn.rollback();
            throw new Error('Database error: ' + error.message);
        } finally {
            if (conn) conn.release();
        }*/
    }

    static async getPriorities() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM priority');
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getUserFromToken(token) {
        try {
            const [rows] = await db.execute(
                'SELECT user.* from user INNER JOIN auth_token on user.user_id = auth_token.user_id WHERE token = ?',
                [token]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTokenByName(token_name, user) {
        try {
            const [rows] = await db.execute(
                'SELECT * from auth_token WHERE name = ? AND user_id = ?',
                [token_name, user.user_id]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTokensForUser(user) {
        try {
            const [rows] = await db.execute(
                'SELECT * from auth_token WHERE user_id = ?',
                [user.user_id]);
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async deleteToken(token) {
        try {
            const [result] = await db.execute(
                'DELETE FROM auth_token WHERE auth_token_id = ?',
                [token.auth_token_id]
            )

            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async createToken(user, tokenName) {
        try {
            const token = crypto.randomBytes(64).toString('base64');

            const [result] = await db.execute(
                'INSERT INTO auth_token (user_id, token, name, create_time) VALUES (?,?,?,?)',
                [user.user_id, token, tokenName, Math.floor(Date.now() / 1000)]
            )

            return token;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async addUserToProject(user, project) {
        try {
            const [result] = await db.execute(
                'INSERT IGNORE INTO user_project (user_id, project_id) VALUES (?,?)',
                [user.user_id, project.project_id]
            );

            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getUserByGUID(guid) {
        try {
            const [rows] = await db.execute(
                'SELECT * from user WHERE guid = ?',
                [guid]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async updateProject(project) {
        try {
            const [result] = await db.execute(
                'UPDATE project SET name=?, owner_id=? WHERE project_id = ?',
                [project.name, project.owner_id, project.project_id]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async updateTask(task) {
        try {
            const [result] = await db.execute(
                'UPDATE task SET name=?, `desc`=?, project_id=?, user_id=?, status_id=?, assigned_user_id=?, due_date=?, priority_id=? WHERE task_id=?',
                [task.name, task.desc, task.project_id, task.user_id, task.status_id, task.assigned_user_id, task.due_date, task.priority_id, task.task_id]
            );
            /*const [result] = await db.execute(
                'INSERT INTO task (task_id, name , `desc`, project_id, user_id, status_id, guid, create_time, assigned_user_id, due_date, priority_id) VALUES (?, ?, ?, ?, ?, ?, ? ,?,?,?, ?) ON DUPLICATE KEY UPDATE name=VALUES(`name`), `desc`=VALUES(`desc`), project_id=VALUES(`project_id`), user_id=VALUES(`user_id`), status_id=VALUES(`status_id`), guid=VALUES(`guid`), create_time=VALUES(`create_time`), assigned_user_id=VALUES(`assigned_user_id`), due_date=VALUES(`due_date`), priority_id=VALUES(`priority_id`)',
                [task.task_id, task.name, task.desc, task.project_id, task.user_id, task.status_id, task.guid, task.create_time, task.assigned_user_id, task.due_date, task.priority_id]
            );*/
            /* const [result] = await db.execute(
                 'REPLACE INTO task (task_id, name , `desc`, project_id, user_id, status_id, guid, create_time, assigned_user_id, due_date, priority_id) VALUES (?, ?, ?, ?, ?, ?, ? ,?,?,?, ?)',
                 [task.task_id, task.name, task.desc, task.project_id, task.user_id, task.status_id, task.guid, task.create_time, task.assigned_user_id, task.due_date, task.priority_id]
             );*/
            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTaskFromGUID(guid) {
        try {
            const [rows] = await db.execute(
                'SELECT * from task WHERE guid = ?',
                [guid]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async deleteProject(project) {

        return await transact(async (conn) => {
            const res1 = await conn.query('UPDATE task SET project_id = null WHERE project_id = ?',
                [project.project_id]);
            const res2 = await conn.query('DELETE FROM user_project WHERE project_id = ?',
                [project.project_id]);
            const res3 = await conn.query('DELETE FROM project WHERE project_id = ?',
                [project.project_id]);
            return {res1, res2, res3};
        })

        /*
        let conn = undefined;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();
            const [result] = await conn.query('DELETE FROM user_project WHERE project_id = ?',
                [project.project_id]);
            const [result2] = await conn.query('DELETE FROM project WHERE project_id = ?',
                [project.project_id]);
            await conn.commit();

            return {result, result2};
        } catch (error) {
            await conn.rollback();
            throw new Error('Database error: ' + error.message);
        } finally {
            if (conn) conn.release();
        }*/
    }

    static async getTasksFromProject(project) {
        try {
            const [rows] = await db.execute('SELECT * FROM task WHERE project_id = ?',
                [project.project_id]);

            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getUsersWithAccessToProject(project) {
        try {
            const [rows] = await db.execute('SELECT user.* from project INNER JOIN user_project on project.project_id = user_project.project_id INNER JOIN user on user_project.user_id = user.user_id WHERE project.project_id =?;',
                [project.project_id]);

            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async saveNewProjectWithUser(project, user) {
        return await transact(async (conn) => {
            const [result] = await conn.execute(
                'INSERT INTO project (name, create_time, guid, owner_id) VALUES (?,?,?, ?)',
                [project.name, project.create_time, project.guid, user.user_id]
            );

            const res2 = await conn.execute(
                'INSERT INTO user_project (user_id, project_id) VALUES (? ,?)',
                [user.user_id, result.insertId]
            );

            return {result, res2};
        })
    }

    static async getStatus() {
        try {
            const [rows] = await db.execute(
                'SELECT * from status');
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getProjectByInternalId(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * from project WHERE project_id = ?',
                [id]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getProjectByGUID(guid) {
        try {
            const [rows] = await db.execute(
                'SELECT * from project WHERE guid = ?',
                [guid]);
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getProjectsForUser(user) {
        try {
            const [rows] = await db.execute(
                'SELECT project.* from user INNER JOIN user_project on user.user_id = user_project.user_id INNER JOIN project on user_project.project_id = project.project_id where user.user_id = ?',
                [user.user_id]);
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getAssignedTasksForUser(user) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM task WHERE assigned_user_id = ?',
                [user.user_id]
            );
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getAllTasksForUser(user) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM task WHERE user_id = ? OR assigned_user_id = ?',
                [user.user_id, user.user_id]
            );
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getOwnedTasksForUser(user) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM task WHERE user_id = ?',
                [user.user_id]
            );
            return rows;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getTaskByGUID(guid) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM task WHERE guid = ?',
                [guid]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async saveTask(task) {
        try {
            const [result] = await db.execute(
                'INSERT INTO task (name, `desc`, project_id, user_id, guid, create_time, assigned_user_id, due_date, priority_id) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?)',
                [task.name, task.desc, task.project_id, task.user_id, task.guid, task.create_time, task.assigned_user_id, task.due_date, task.priority_id]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getUserByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM user WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async getUserById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM user WHERE user_id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async updateUser(user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 12);
            const [result] = await db.execute(
                'UPDATE user SET name = ?, username = ?, email = ?, password = ? WHERE user_id = ?',
                [user.name, user.username, user.email, hashedPassword, user.user_id]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    static async saveUser(user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 12);
            const [result] = await db.execute(
                'INSERT INTO user (name, username, email, password, guid, create_time) VALUES (?, ?, ?, ?, ?, ?)',
                [user.name, user.username, user.email, hashedPassword, user.guid, user.create_time]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('username')) {
                    throw new Error('Username already exists');
                } else if (error.message.includes('email')) {
                    throw new Error('Email already exists');
                }
            }
            throw new Error('Database error: ' + error.message);
        }
    }
}