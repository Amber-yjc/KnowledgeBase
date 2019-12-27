const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const { Router } = require('express')
// you need to import the followings for input validation
const { validateInput, expressValidateInput } = require('../utils/ValidationUtil');
const { authRequired } = require('../utils/Middlewares');
const { ParamTypes } = require('../utils/Validator');

const router = Router();

router.post('/add',
    authRequired,
    validateInput({
        subject: ParamTypes.string.isRequired,
        text: ParamTypes.string.isRequired,
        topic_id: ParamTypes.number.isRequired,
    }),
    async (req, res) => {
        const { subject, text, topic_id } = req.body;
        const topic = Topic[topic_id];
        if (topic == undefined) {
            return res.status(422).send('invalid topic');
        }
        const response = await Post.add({
            subject,
            text,
            topic,
            author_id: req.session.userid,
        });
        return res.status(200).send(response);
    });

router.post('/replyto',
    authRequired,
    validateInput({
        post_id: ParamTypes.number.isRequired,
        text: ParamTypes.string.isRequired
    }),
    async (req, res) => {
        const { post_id, text } = req.body;
        await Post.replyTo({ post_id, replier_id: req.session.userid, text });
        res.redirect('/post/replies?post_id=' + post_id);
    })

router.get('/all',
    authRequired,
    async (req, res) => {
        const userid = req.session.userid;
        const userinfo = await User.getById(userid);
        const posts = await Post.getAllByUserId(userid);

        return res.render('allposts', { userinfo, posts });
    })

router.get('/replies',
    authRequired,
    validateInput({
        post_id: ParamTypes.number.isRequired
    }),
    async (req, res) => {
        const { post_id } = req.query;
        // fetch post info
        const post = await Post.getById(post_id);
        // fetch reply info
        const replies = await Post.getRepliesByPostId(post_id);
        res.render('replies', { ...post, replies });
    });

router.get('/topics', (req, res) => {
    return res.status(200).json(Topic);
})

module.exports = router;