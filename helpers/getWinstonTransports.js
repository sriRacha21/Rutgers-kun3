// import for tranports setup
const winston = require('winston')
require('winston-daily-rotate-file')
const { Mail } = require('winston-mail')
// import for reading in emails for transports
const fs = require('fs')
const API_Keys = JSON.parse(fs.readFileSync('settings/api_keys.json', 'utf-8'))
const emails = fs.existsSync('settings/email_logging.json') ? JSON.parse(fs.readFileSync('settings/email_logging.json','utf-8')) : null

function getWinstonTransports() {
    const transports = []

    // put all logs in files
    for( const level in winston.config.npm.levels ) {
        if( level == 'silly' )
            continue

        transports.push(new winston.transports.DailyRotateFile({
            filename: `logs/${level}-%DATE%.log`,
            level: level,
            maxFiles: '14d',
        }))
    }

    // email errors
    for( const level in emails ) {
        const email = emails[level].email
        if( email ) {
            if( !API_Keys.smtp_password ) {
                logger.log( 'error', 'SMTP password not set!' )
                continue
            }
            transports.push(new Mail({
                to: email,
                from: "winston-error@mailgun.rutgersesports.com", // think about making this configurable
                host: 'smtp.mailgun.org',
                port: 587,
                username: "postmaster@mailgun.rutgersesports.com",
                password: API_Keys.smtp_password,
                level: level,
                subject: `Rutgers-kun3 error! Severity level: ${level}.`,
                html: true,
            }))
        }
    }

    // output debugs straight to the console
    transports.push(new winston.transports.Console({
        level: 'debug',
    }))

    return transports
}

exports.getWinstonTransports = getWinstonTransports