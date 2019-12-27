const logger = require('./Logger');
const mysql = require('mysql2/promise');
const fs = require('fs-extra');
const axios = require('axios')
const MYSQL_META_FILE = './deployment/meta.json'
const SQL_SCRIPT_NAMING = /^(\d+)-.+?\.sql$/;

class MySQLUtil {

    constructor(generalConfig, database) {
        this.generalConfig = generalConfig;
        this.database = database;
    }

    async query(queryString, values) {
        if (!this.pool) {
            this.pool = this.createPool({ database: this.database });
        }
        try {
            if (values) {
                return await this.pool.query(queryString, values);
            } else {
                return await this.pool.query(queryString);
            }
        } catch (e) {
            logger.error(e);
            return null;
        }
    }

    createPool(option) {
        return mysql.createPool({ ...this.generalConfig, ...option });
    }

    createConnection(option) {
        return mysql.createConnection({ ...this.generalConfig, ...option });
    }

    async runMultiStatement(sqlScript) {
        const connection = await this.createConnection({ multipleStatements: true });

        return connection.beginTransaction()
            .then(() => connection.query(`USE ${process.env.MYSQL_DB}`))
            .then(() => connection.query(sqlScript))
            .then(() => connection.commit())
            .then(() => connection.end());
    }

    async runSqlScripts() {
        const lastVersion = await this.lastestVersion();
        const files = await fs.readdir('./deployment/sql');

        const sqlScripts = [];

        files.forEach((fileName) => {
            const result = SQL_SCRIPT_NAMING.exec(fileName);
            if (result) {
                const version = parseInt(result[1]);
                if (version > lastVersion) {
                    sqlScripts.push({ version, fileName });
                }
            }
        });

        sqlScripts.sort((a, b) => {
            return a.version - b.version;
        });

        for (let i = 0; i < sqlScripts.length; i++) {
            const { version, fileName } = sqlScripts[i];

            const succeed = await fs.readFile(`./deployment/sql/${fileName}`, { encoding: "utf-8" })
                .then(script => {
                    return this.runMultiStatement(script)
                        .then(() => {
                            if (process.env.HEROKU) {
                                this.updateHerokuVersion(version).then(response => {
                                    if (response) {
                                        return version;
                                    }
                                    return null;
                                })
                            }
                            this.writeNewVersion(version);
                            logger.info(`Successfully ran SQL script ${fileName}`);
                            return version;
                        })
                        .catch((err) => {
                            logger.error(`error occured when running ${fileName}: `);
                            logger.error(err);
                            return null;
                        });
                });
            if (!succeed) {
                return false;
            }
        }

        return true;
    }

    async lastestVersion() {
        if (process.env.HEROKU) {
            return process.env.SQL_VERSION
        }
        const exist = await fs.pathExists(MYSQL_META_FILE);
        if (exist) {
            const meta = await fs.readJSON(MYSQL_META_FILE);
            return meta.version;
        }

        this.writeNewVersion(0);

        return 0;
    }

    async writeNewVersion(version) {
        fs.writeJSON(MYSQL_META_FILE, {
            version
        });
    }

    async updateHerokuVersion(version) {
        axios.patch('https://api.heroku.com/apps/knowledge--base/config-vars',
        {
            "SQL_VERSION": version
        },
        {headers: {'Content-Type': 'application/json',
                    'Accept': 'application/vnd.heroku+json; version=3',
                    'Authorization': process.env.API_AUTH}})
        .then(function (response) {
          return true;
        })
        .catch(function (err) {
            logger.error(`error occured when updating heroku version: `);
            logger.error(err);
            return null;
        })
    }

}

const mysqlUtil = new MySQLUtil({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
}, process.env.MYSQL_DB);

module.exports = mysqlUtil;