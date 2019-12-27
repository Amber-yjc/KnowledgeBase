const logger = require('./Logger');

const authRequired = (req, res, next) => {
    if (req.session.userid != null) {
        return next();
    }
    res.redirect('/user')
}

const errorHandler = (err, req, res, next) => {
    logger.error(err);
    // Maybe render a error page?
    res.status(500).json({
        error: err.constructor.name,
        msg: err.message
    });
};

const emptyBodyParser = (req, res, next) => {
    req.query = req.query || {};
    req.body = req.body || {};
    next();
};

const notFoundRequestHandler = (req, res, next) => {
    // Maybe render a 404 not found page?
    if (req.session.userid) {
        return res.redirect('/user/homepage');
    } else {
        return res.redirect('/user');
    }
};

module.exports = {
    authRequired,
    errorHandler,
    emptyBodyParser,
    notFoundRequestHandler
}