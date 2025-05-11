/**
 *  @file Manages the Database connection for a MySQL database.
 *  Sets up and populates a new database, and then returns a pool for connections to be derived from
 *  @author Neil Trotter
 */

const mysql = require('mysql2/promise');
const log = require('../util/logUtil');
const fs = require('fs');
const path = require('path');
let tableExpect = 0;

let multiQuery = true;

if(process.env.DB_MULTI_QUERY) {
    multiQuery = process.env.DB_MULTI_QUERY;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: multiQuery,
});

fs.readdir("config/dbSetup/", (err, files) => {
    if (err) throw err;
    log("DB", `Found ${files.length} sql setup files`);
    tableExpect = files.length - 1;
})

pool.query(`SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE TABLE_SCHEMA = ?`, process.env.DB_NAME)
    .then(([rows, _]) => {
        const {count} = rows[0];

        if (count !== tableExpect) {
            log("DB", `DB Looks Malformed, expected ${tableExpect} tables, found ${count}`);
            if (count === 0) {
                log("DB", "Empty database found: Running creation scripts");

                const runOrder = [
                    'priority',
                    'status',
                    'user',
                    'project',
                    'task',
                    'user_project',
                    'task_status_log',
                    'project_invite',
                    'webhook_destination',
                    'project_webhook',
                    'auth_token',
                    'populate_data'
                ];

                function runScript(space){
                    if(space < runOrder.length) {
                        const script = fs.readFileSync(path.join("config/dbSetup/", `${runOrder[space]}.sql`)).toString();
                        pool.query(script).then((_, err) => {
                            if (err) {
                                log(`DB`, `Failed to run: ${runOrder[space]} : ${err}`);
                            } else {
                                log(`DB`, `${runOrder[space]} run successfully.`);
                                runScript(space + 1);
                            }
                        });
                    }
                }
                runScript(0);
            }
        } else {
            log("DB", "DB looks good!");

            if(multiQuery) {
                log("-", "---------------Warning---------------");
                log("DB", "DB has been left in Multi Statement mode");
                log("DB", "MSM should be disabled after first run");
                log("DB", "Single statements help protect against SQL injection");
                log("DB", "To disable MSM, set DB_MULTI_QUERY=false")
                log("-", "--------------------------------------")
            }
        }
    });

module.exports = pool;
