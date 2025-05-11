require('dotenv').config();
const app = require('./app.js');
const log = require("./util/logUtil");

app.listen(process.env.SERVER_PORT, process.env.INTERFACE_ADDRESS, () => {
    log("SERV", `Listening on ${process.env.INTERFACE_ADDRESS}:${process.env.SERVER_PORT}`);
})