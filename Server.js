const { missingEnvironmentVariable } = require("./utils/EnvUtil");
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const logger = require('./utils/Logger');
const path = require('path');
const session = require('express-session');
const mysqlUtil = require('./utils/MySQLUtil');
const moment = require('moment')
const {
    errorHandler,
    emptyBodyParser,
    notFoundRequestHandler
} = require('./utils/Middlewares')

const RoutesMapping = {
    '/user': require('./routers/UserRouter'),
    '/message': require('./routers/MessageRouter'),
    '/post': require('./routers/PostRouter'),
};

async function startServer() {
    const successfullyRanSQLScripts = await mysqlUtil.runSqlScripts();
    if (!successfullyRanSQLScripts) {
        logger.error(`Server failed to start up: Failed to ran SQL scripts`);
        return;
    }

    const app = express();
    var http = require('http').Server(app);
    // Dev environment only
    if (process.env.NODE_ENV !== "production") {
        // HTTP Request logger, only used for dev environment
        app.use(morgan("dev"));
    }

    const MySQLStore = require("express-mysql-session")(session);

    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            store: new MySQLStore({}, await mysqlUtil.createPool({ database: process.env.MYSQL_DB })),
            resave: false,
            saveUninitialized: false
        })
    );

    // Apply Body Parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(emptyBodyParser);

    // serve static assets
    app.use(express.static(path.join(__dirname, "public")));

    // attach routers
    for (const key of Object.keys(RoutesMapping)) {
        app.use(key, RoutesMapping[key]);
    }

    // handlebars
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hjs');
    app.engine('hjs', require('express-handlebars')({
        helpers: {
            notEmpty: function(object) {return Object.keys(object).length !== 0},
            equals: function(item1, item2) {return item1 === item2},
            getCss: function() {return ['general','homepage','login','message','profile','replies']}
        },
        partialsDir: path.join(__dirname, 'views', 'partials')
    }));

    // Exception handling
    app.use(errorHandler);
    app.use(notFoundRequestHandler);

    const io = require('socket.io')(http);
    io.on('connection', function (socket) {
        socket.on('startChat',function(data){
            socket.join(data.chatId);
        });
        socket.on('newMessage',function(data) {
            io.sockets.in(data.chatId).emit('newMessage', {'chatId': data.chatId});
        });
        socket.on('disconnect', function (data) {
            console.log(socket.id + " disconnected");
        });
            
    });

    http.listen(process.env.PORT, (server) => {
        logger.info(`Server running at port ${process.env.PORT}`);
    });


}

if (process && process.env && process.env.HEROKU || !missingEnvironmentVariable) {
    startServer();
} else {
    logger.error(`Server failed to start up: Missing Environment Variable`);
}