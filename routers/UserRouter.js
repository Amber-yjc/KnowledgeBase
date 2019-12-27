const UserController = require('../controllers/UserController');
const Post = require('../models/Post');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Like = require('../models/Like');
const { Router } = require('express')
// you need to import the followings for input validation
const { validateInput, expressValidateInput } = require('../utils/ValidationUtil');
const { authRequired } = require('../utils/Middlewares');
const { ParamTypes } = require('../utils/Validator');
const { check } = require('express-validator');

const router = Router();

router.get('/', (req, res) => {
    if (req.session.userid) {
        return res.redirect('/user/homepage');
    }
    return res.render('login');
});

router.get('/homepage',
    authRequired,
    validateInput({
        keyword: ParamTypes.string,
        topic: ParamTypes.number,
        page: ParamTypes.number
    }),
    async (req, res) => {
        const { keyword, topic, page = 1 } = req.query;
        const post_per_page = 5;
        const userinfo = await User.getById(req.session.userid);
        let posts;
        let prevPage, nextPage;
        if (keyword != undefined) {
            posts = await Post.getByKeywordByPage(keyword, page, post_per_page);
        } else if (topic != undefined) {
            posts = await Post.getByTopicByPage(Topic[topic], page, post_per_page);
        } else {
            posts = await Post.getByPage(page, post_per_page);
            const numPosts = await Post.size();
            const numPages = Math.ceil(numPosts / post_per_page);
            prevPage = page > 1 ? page - 1 : null;
            nextPage = page < numPages ? page + 1 : null;
        }

        res.render('homepage', { userinfo, topics: Topic, posts, prevPage, nextPage });
    });

// I am just using it as an example, please feel free to change it in order to make it work
router.post('/add',
    // a middleware to make sure username and password are string and are not missing
    validateInput({
        email: ParamTypes.string.isRequired,
        password: ParamTypes.string.isRequired,
        firstname: ParamTypes.string.isRequired,
        lastname: ParamTypes.string.isRequired,
        img_url: ParamTypes.string,
        birth_date: ParamTypes.date,
        description: ParamTypes.string,
        country: ParamTypes.string,
    }),
    expressValidateInput([
        check('email').isEmail()
    ]),
    async (req, res) => {
        // this function will not be called if the validation faield
        // which means username and password are guaranteed to be string and are given
        const response = await UserController.signUp(req.body);
        if (response === 'occupied') {
            return res.render('login', { signup_err: 'The email address has already been used for another account' })
        }
        req.session.userid = response;
        res.redirect('/user/homepage');
    });

router.post('/login',
    validateInput({
        email: ParamTypes.string.isRequired,
        password: ParamTypes.string.isRequired
    }),
    async (req, res) => {
        const id = await UserController.login(req.body);
        if (id == null) {
            return res.render('login', { login_err: 'Incorrect email or password' })
        }
        req.session.userid = id;
        return res.redirect('/user/homepage');
    }
)

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/user');
});

router.get('/profile',
    authRequired,
    validateInput({
        userid: ParamTypes.number.isRequired
    }),
    async (req, res) => {
        const { userid } = req.query;

        const userinfo = await User.getById(userid);
        const liked = await Like.checkLikeExist({ fromUser: req.session.userid, toUser: userid });
        const posts = await Post.getAllByUserId(userid);
        const currentUserId = req.session.userid

        return res.render('profile', { userinfo: { ...userinfo, liked, currentUserId }, posts });
    })

router.post('/edit-profile',
    authRequired,
    validateInput({
        firstname: ParamTypes.string.isRequired,
        lastname: ParamTypes.string.isRequired,
        img_url: ParamTypes.string.isRequired,
        birth_date: ParamTypes.date,
        description: ParamTypes.string,
        country: ParamTypes.string,
    }),
    async (req, res) => {
        await User.update(req.session.userid, req.body);
        res.redirect('/user/edit-profile');
    })

router.get('/edit-profile',
    authRequired,
    async (req, res) => {
        const userinfo = await User.getById(req.session.userid);

        if (userinfo.birth_date && userinfo.birth_date !== "0000-00-00 00:00:00" && new Date(userinfo.birth_date) != "Invalid Date") {
            userinfo.birth_date = new Date(userinfo.birth_date).toISOString().split('T')[0];
        }

        res.render('edit_profile', { userinfo });
    })

router.post('/like',
    authRequired,
    validateInput({
        toUser: ParamTypes.number.isRequired
    }),
    async function (req, res) {
        const { toUser } = req.body;
        await Like.like({ fromUser: req.session.userid, toUser });

        res.redirect(req.get('referer'));
    })

module.exports = router;