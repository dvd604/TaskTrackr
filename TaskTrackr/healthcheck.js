/**
 * @file Standalone basic healthcheck system.
 * Only used if TaskTrackr is run in a Docker container
 * Simply requests the page at / and checks for a redirect - if present, it assumes the server is alive
 */

const http = require('http');
const options = {
    host: '0.0.0.0',
    port: process.env.SERVER_PORT,
    timeout: 2000
};

const healthCheck = http.request(options, (res) => {
    if (res.statusCode === 302) {
        console.log(`Got Redirect - Service alive`);
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});

healthCheck.on('error', function (err) {
    console.error(`Err: ${err}`);
    process.exit(1);
});

healthCheck.end();
