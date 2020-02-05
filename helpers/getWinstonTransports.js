// import for tranports setup
const winston = require('winston')
require('winston-daily-rotate-file')
const { Mail } = require('winston-mail')
// import for reading in emails for transports
const fs = require('fs')
const API_Keys = JSON.parse(fs.readFileSync('settings/api_keys.json', 'utf-8'))
const { host, port, domain, username, password } = JSON.parse(fs.readFileSync('settings/smtp_server.json', 'utf-8'))
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
            transports.push(new Mail({
                to: email,
                from: `winston-error@${domain}`, // think about making this configurable
                host: host,
                port: port ? port : 587,
                username: username,
                password: password,
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