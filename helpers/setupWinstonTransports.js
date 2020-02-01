// import for tranports setup
const winston = require('winston')
require('winston-daily-rotate-file')
const { Mail } = require('winston-mail')
// import for reading in emails for transports
const fs = require('fs')
const API_Keys = JSON.parse(fs.readFileSync('settings/api_keys.json', 'utf-8'))
const emails = fs.existsSync('settings/email_logging.json') ? JSON.parse(fs.readFileSync('settings/email_logging.json','utf-8')) : null

const { inspect } = require('util')

function setupWinstonTransports( logger ) {
    logger.clear()

    for( const level in winston.config.npm.levels ) {
        if( level == 'silly' )
            continue

        logger.add(new winston.transports.DailyRotateFile({
            filename: `logs/${level}-%DATE%.log`,
            level: level,
            maxFiles: '14d',
        }))
    }

    for( const level in emails ) {
        const email = emails[level].email
        if( email ) {
            logger.add(new Mail({
                to: email,
                from: "winston-error@mailgun.rutgersesports.com", // think about making this configurable
                host: 'smtp.mailgun.org',
                port: 587,
                username: "postmaster@mailgun.rutgersesports.com",
                password: API_Keys.smtp_password,
                level: level,
                subject: `Rutgers-kun error! Severity level: ${level}.`,
                html: true,
            }))
        }
    }
}

exports.setupWinstonTransports = setupWinstonTransports