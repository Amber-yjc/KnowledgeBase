const winston = require('winston');

const errorStackFormat = winston.format(info => {
	if (info.level === 'error' && info.stack) {
		return Object.assign({}, info, {
			message: info.stack,
		})
	}
	return info;
})

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		errorStackFormat(),
		winston.format.timestamp(),
		winston.format.printf((info) => {
			return `${info.timestamp} ${info.level}: ${info.message}`;
		})
	),
	transports: [
		new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: './logs/combined.log' })
	]
});


if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console());
}

module.exports = logger;