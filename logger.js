const winston = require('winston');
const { getWinstonTransports } = require('./helpers/logging/getWinstonTransports');

module.exports = winston.createLogger({
    transports: getWinstonTransports()
});
