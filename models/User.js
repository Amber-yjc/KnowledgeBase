const mysqlUtil = require('../utils/MySQLUtil');

class User {

    async hasUser(params) {
        const { email } = params;
        const [rows, fields] = await mysqlUtil.query('SELECT 1 FROM `user` where `email`=?;', [email]);
        return rows.length !== 0;
    }
    // function to add a user into the user database
    async add(params) {
        const { password, firstname, lastname, email, img_url = 'https://www.drupal.org/files/issues/default-avatar.png', description, country, birth_date } = params;
        const [{ insertId }] = await mysqlUtil.query('INSERT INTO `user`' +
            '(password, firstname, lastname, email, img_url, description, country, birth_date)' +
            ' VALUES (?, ? ,? ,? ,?, ?, ?, ?);',
            [password, firstname, lastname, email, img_url, description,
                country, birth_date]);
        return insertId;
    }

    // function to get the information of the user by username and password (for logging in)
    async get(params) {
        const { email, password } = params;
        const [rows] = await mysqlUtil.query('SELECT * FROM `user` WHERE email = ? AND password = ?', [email, password]);
        return rows[0];
    }

    async getByEmail(email) {
        const [rows] = await mysqlUtil.query('SELECT * FROM `user` WHERE email = ?;', [email]);
        return rows[0];
    }

    async getById(id) {
        const [rows] = await mysqlUtil.query('SELECT * FROM `user` WHERE id = ?;', [id]);
        return rows[0];
    }

    // function to update the user information by id
    async update(id, params) {
        const { firstname, lastname, img_url, description, country, birth_date } = params;
        mysqlUtil.query(
            "UPDATE `user` \
            SET `firstname` = ?, `lastname` = ?, \
            `img_url` = ?, `description` = ?, `birth_date` = ?, \
            `country` = ? \
            WHERE(`id` = ?);",
            [firstname, lastname, img_url, description, birth_date, country, id]
        );
    }

    async incrementPostCount(userid) {
        await mysqlUtil.query(
            'UPDATE `user` \
            SET post_count = post_count + 1 \
            WHERE id = ?',
            [userid]
        );
    }

    async incrementMessageCount(userid) {
        await mysqlUtil.query(
            'UPDATE `user` \
            SET message_count = message_count + 1 \
            WHERE id = ?',
            [userid]
        );
    }

    async incrementLikeCount(userid) {
        await mysqlUtil.query(
            'UPDATE `user` \
            SET like_count = like_count + 1 \
            WHERE id = ?',
            [userid]
        );
    }

    async decrementLikeCount(userid) {
        await mysqlUtil.query(
            'UPDATE `user` \
            SET like_count = like_count - 1 \
            WHERE id = ?',
            [userid]
        );
    }

}

module.exports = new User();