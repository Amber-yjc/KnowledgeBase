const MessageController = require('../controllers/MessageController');
const { Router } = require('express')
const { validateInput } = require('../utils/ValidationUtil');
const { ParamTypes } = require('../utils/Validator');
const { authRequired } = require('../utils/Middlewares');

const router = Router();

router.get('/', authRequired, 
validateInput({
    userId: ParamTypes.number.isRequired,
}),
async (req, res, next) => {
    const to = req.query.userId;
    res.render('message', {to: to});
})

router.post('/create', authRequired,
    validateInput({
        to: ParamTypes.number.isRequired,
        subject: ParamTypes.string.isRequired,
        text: ParamTypes.string.isRequired
    }),
    async (req, res, next) => {
        const { to, subject, text } = req.body;
        const from = req.session.userid;
        const result = await MessageController.createChat({from, to, subject, text});
        res.redirect('/user/profile?userid='+ to);
    });

router.post('/send', authRequired,
    validateInput({
        chatId: ParamTypes.number.isRequired,
        text: ParamTypes.string.isRequired
    }),
    async (req, res, next) => {
        console.log(req.body)
        const { chatId, text } = req.body;
        const from = req.session.userid;
        const result = await MessageController.postMessage({chatId, from, text});
        res.sendStatus(200)
        //res.redirect('/message/chat?chatId=' + chatId)
    });

router.get('/chat', authRequired,
    validateInput({
        chatId: ParamTypes.number
    }),
    async (req, res) => {
        const userId = req.session.userid;
        const result = await MessageController.getChat({userId});
        let { chatId } = req.query;
        if (result && result.length && !chatId) {
            chatId = result[0].chat_id
        }
        const messages = await MessageController.getMessages({chatId, userId});
        res.render('chat', {result, messages, selected:chatId});
});

module.exports = router;