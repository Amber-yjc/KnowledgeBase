const mysqlUtil = require('../utils/MySQLUtil');
const Message = require('../models/Message');
const SendMail = require('../utils/SendMail')
const User = require('../models/User')

class MessageController {

    async createChat(params) {
        const { from, to, subject, text } = params;
        const chatId = await Message.createChat({from, to, subject});
        console.log(chatId);
        if (chatId) {
            const result = await Message.sendMessage({chatId, from, text});
            if (result) {
                const fromIncrement = User.incrementMessageCount(from);
                const toIncrement = User.incrementMessageCount(to);
                const senderInfo = await User.getById(from)
                const recipientInfo = await User.getById(to)
                const emailStructure = {
                    from: senderInfo.email,
                    to: recipientInfo.email,
                    subject,
                    text
                }
                console.log(emailStructure)
                const sendmailResult = await SendMail.sendMail(emailStructure)
                return result;
            }
        }
        return 'failure';
    }

    async postMessage(params) {
        const { chatId, from, text } = params;
        const result = await Message.sendMessage({chatId, from, text});
        await Message.updateChatTime({chatId});
        return result;
    }

    
    async getChat(params) {
        const { userId } = params;
        const result = await Message.getChat({userId});
        return result;
    }

    async getMessages(params) {
        const { chatId, userId } = params;
        const result = await Message.getMessages({chatId, userId});
        return result;
    }


}

module.exports = new MessageController();