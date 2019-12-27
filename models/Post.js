const mysqlUtil = require('../utils/MySQLUtil');
const User = require('../models/User');

class Post {

    async add(params) {
        const { subject, text, topic, author_id } = params;
        await mysqlUtil.query(
            'INSERT INTO `post` \
            (`subject`, `text`, `topic`, `date`, `author_id`) \
            VALUES (?, ?, ?, ?, ?);',
            [subject, text, topic, new Date(), author_id]
        )
        await User.incrementPostCount(author_id);
        return 'succeeded';
    }

    async getById(post_id) {
        const [rows] = await mysqlUtil.query(
            'SELECT p.post_id, p.reply_count, p.subject, p.text, p.topic, p.date, u.id, u.img_url AS avatar_url FROM `post` p \
            LEFT JOIN \
            `user` u \
            ON p.author_id = u.id \
            WHERE post_id = ?;',
            [post_id]
        );
        return rows[0];
    }

    async getByPage(page, nums = 5) {
        page--;
        const [rows] = await mysqlUtil.query(
            'SELECT p.post_id, p.reply_count, p.subject, p.text, p.topic, p.date, u.id, u.img_url AS avatar_url FROM `post` p \
            LEFT JOIN \
            `user` u \
            ON p.author_id = u.id \
            ORDER BY `date` DESC LIMIT ?, ?',
            [page * nums, nums]);
        return rows;
    }

    async getByTopicByPage(topic, page, nums = 5) {
        page--;
        const [rows] = await mysqlUtil.query(
            'SELECT p.post_id, p.reply_count, p.subject, p.text, p.topic, p.date, u.id, u.img_url AS avatar_url FROM `post` p \
            LEFT JOIN \
            `user` u \
            ON p.author_id = u.id \
            WHERE p.topic = ?\
            ORDER BY `date` DESC LIMIT ?, ?',
            [topic, page * nums, nums]);
        return rows;
    }

    async getByKeywordByPage(keyword, page, nums = 5) {
        page--;
        const [rows] = await mysqlUtil.query(
            'SELECT p.post_id, p.reply_count, p.subject, p.text, p.topic, p.date, u.id, u.img_url AS avatar_url FROM `post` p \
            LEFT JOIN \
            `user` u \
            ON p.author_id = u.id \
            WHERE p.subject LIKE CONCAT("%", ?, "%") \
            ORDER BY `date` DESC LIMIT ?, ?',
            [keyword, page * nums, nums]);
        return rows;
    }

    async getAllByUserId(userid) {
        const [rows] = await mysqlUtil.query(
            'SELECT p.post_id, p.reply_count, p.subject, p.text, p.topic, p.date, u.id, u.img_url AS avatar_url FROM `post` p \
            LEFT JOIN \
            `user` u \
            ON p.author_id = u.id \
            WHERE author_id = ? \
            ORDER BY `date` DESC',
            [userid]
        )
        return rows;
    }

    async replyTo(params) {
        const { post_id, replier_id, text } = params;
        await mysqlUtil.query(
            'INSERT INTO `reply` \
            (`post_id`, `replier_id`, `text`, `date`) \
            VALUES (?, ?, ?, ?);',
            [post_id, replier_id, text, new Date()]
        )
        await this.incrementReplyCount(post_id);
        return 'succeeded';
    }

    async incrementReplyCount(post_id) {
        await mysqlUtil.query(
            'UPDATE `post` \
            SET reply_count = reply_count + 1 \
            WHERE post_id = ?',
            [post_id]
        );
    }

    async getRepliesByPostId(post_id) {
        const [rows] = await mysqlUtil.query(
            'SELECT r.text, u.id, u.img_url AS avatar_url FROM `reply` r \
            LEFT JOIN \
            `user` u \
            ON r.replier_id = u.id \
            WHERE post_id = ? \
            ORDER BY `date` ASC;',
            [post_id]
        );
        return rows;
    }

    async size() {
        const [rows] = await mysqlUtil.query('SELECT COUNT(*) AS size FROM `post`;')
        return rows[0].size;
    }

}

module.exports = new Post();