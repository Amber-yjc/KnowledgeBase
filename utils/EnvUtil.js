const dotenv = require('dotenv');
const logger  = require('./Logger');

logger.info('Initializing Environment Variables...');

dotenv.config({ path: ".env" });

const environmentVariables = [
    "NODE_ENV",
    "PORT",
    "SESSION_SECRET",
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DB"
];

let missingEnvironmentVariable = false;

environmentVariables.forEach((key) => {
    if (!process.env[key]) {
        logger.error(`Missing environment variable ${key}`);
        missingEnvironmentVariable = true;
    }
});

module.exports = { missingEnvironmentVariable };