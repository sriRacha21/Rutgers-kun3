const winston = require('winston')
const { getWinstonTransports } = require('./helpers/getWinstonTransports')

module.exports = winston.createLogger({
    transports: getWinstonTransports()
})