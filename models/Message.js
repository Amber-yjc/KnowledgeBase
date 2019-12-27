const mysqlUtil = require('../utils/MySQLUtil');
const _ = require('lodash')
const moment = require('moment')

class Message {

    async createChat(params) {
        const { from, to, subject } = params;
        const result = await mysqlUtil.query('INSERT INTO `chat` (fromuser, touser, subject) VALUES (?, ?, ?);', [from, to, subject]);
        if (result && result.length) {
            return result[0].insertId;
        }
        return null;
    }

    async sendMessage(params) {
        const { chatId, from, text } = params;
        const result = await mysqlUtil.query('INSERT INTO `message` (chat_id, user_id, text)  VALUES (?, ?, ?);', [chatId, from, text]);
        return result[0].insertId;
    }

    async updateChatTime(params) {
        const { chatId } = params;
        const result = await mysqlUtil.query('UPDATE `chat` set date = CURRENT_TIMESTAMP where id = ?', [chatId]);
        console.log(result);
        return result;
    }

    async getChat(params) {
        const { userId } = params;
        const result = await mysqlUtil.query('SELECT c.id chat_id, c.date, c.fromuser, c.touser, c.subject, u.id, u.img_url, u.firstname, u.lastname FROM `chat` c \
        LEFT JOIN \
        `user` u \
        on c.fromuser = u.id or \
        c.touser = u.id \
        where (c.`fromuser`=? or c.`touser`=?) \
        and u.`id` != ? \
        ORDER BY c.date DESC;', [userId, userId, userId]);
        const chats = result[0];
        return (chats);
    }

    async getMessages(params) {
        const { chatId, userId } = params;
        const result = await mysqlUtil.query('SELECT DISTINCT m.chat_id, m.user_id, m.text, m.date, u.id, u.img_url, u.firstname, u.lastname FROM `chat` c \
        LEFT JOIN \
        `message` m \
        on m.chat_id = c.id \
        LEFT JOIN \
        `user` u \
        on u.`id` = m.`user_id` \
        where (c.`fromuser`=? or c.`touser`=?) and m.`chat_id`=? \
        ORDER BY m.date ASC;', [userId, userId, chatId]);
        const messages = result[0];
        const messagesByDate = _.groupBy(messages, function(message) {
            return moment(message.date).subtract(8, 'hours').format("YYYY-MM-DD")
          })
        return messagesByDate;
    }

}

module.exports = new Message();