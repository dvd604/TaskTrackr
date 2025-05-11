const db = require("../config/data/db-direct");

/**
 * Wrapper for HTTP POST requests with content type set to JSON
 * @param {string} loc - The URL to send the request to
 * @param {string} message - The message to send
 */
function sendMessage(loc, message) {
    fetch(loc, {
        method: "POST",
        body: message,
        headers: {
            'content-type': 'application/json',
        }
    }).catch(err => {
        console.log(err);
    })
}

/**
 * Gets a webhook destination and format for a given project
 * @param project - The project to find webhook info for
 * @returns {Promise<undefined|{webhook: *, format}>} - Undefined if no webhook set, or an object with webhook location and format
 */
async function getWebhook(project) {
    if (!project) {
        return undefined;
    }

    const webhook = await db.getWebhookForProject(project);

    if (!webhook) {
        return undefined;
    }

    const webhookLocation = await db.getWebhookTypes();
    return {
        format: webhookLocation.find(whl => {
            return whl.webhook_destination_id === webhook.webhook_destination_id
        }).format,
        webhook: webhook
    };
}

/**
 * Function called when a Task's Status is updated
 * @param req - Express request
 * @returns {Promise<void>}
 */
async function handleStatusSet(req) {
    const {guid, status} = req.body;
    const task = await db.getTaskFromGUID(guid);
    const project = await db.getProjectByInternalId(task.project_id);

    const webhook = await getWebhook(project);

    if (!webhook || !webhook.format) {
        return;
    }

    const statusObj = await db.getStatus();
    const statusText = statusObj.find(st => {
        return st.status_id == status
    }).name;
    const taskName = task.name;


    let payload = `${req.user.name} (${req.user.username}) just marked Task \`${taskName}\` as \`${statusText}\``;
    const message = webhook.format.replace("message", payload);

    sendMessage(webhook.webhook.webhook_location, message);
}

/**
 * Function called when a Task is added
 * @param req - Express request
 * @returns {Promise<void>}
 */
async function handleTaskAdd(req) {
    const {project_guid, name, due_date} = req.body;
    const project = await db.getProjectByGUID(project_guid);

    const webhook = await getWebhook(project);

    if (!webhook || !webhook.format) {
        return;
    }

    let payload = `${req.user.name} (${req.user.username}) just created Task \`${name}\`. It's due on \`${due_date}\``;
    const message = webhook.format.replace("message", payload);

    sendMessage(webhook.webhook.webhook_location, message);
}

/**
 * Function called when a Task is removed
 * @param req - Express request
 * @returns {Promise<void>}
 */
async function handleRemoveTask(req) {
    const task = req.task;
    const project = await db.getProjectByInternalId(task.project_id);
    const webhook = await getWebhook(project);

    if (!webhook || !webhook.format) {
        return;
    }

    let payload = `${req.user.name} (${req.user.username}) just deleted Task \`${task.name}\``;
    const message = webhook.format.replace("message", payload);

    sendMessage(webhook.webhook.webhook_location, message);
}

/**
 * Exposed entry point to the Webhook system - decides where, if anywhere, the request should be directed
 * @param req - the Express request
 */
const doWebhook = async (req) => {
    if (req.url === '/status/set') {
        await handleStatusSet(req);
    }

    if (req.url === '/modal/add' || (req.url === '/task' && req.method === 'POST')) {
        await handleTaskAdd(req);
    }

    if(req.url === '/remove') {
        await handleRemoveTask(req);
    }
};

module.exports = {
    doWebhook
};