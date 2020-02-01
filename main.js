/*  IMPORTS AND GENERAL SETUP   */
// import sqlite to use as SettingsProvider
const sqlite = require('sqlite')
// import path to join paths in a platform-dependent way
const path = require('path')
// prepare to read in data from JSON files
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
// read in data from JSON file containing default settings for the bot (ClientOptions object)
const ClientOptions = JSON.parse(fs.readFileSync('settings/bot_settings.json', defaults.encoding))
// read in data from JSON file containing API keys
const API_Keys = JSON.parse(fs.readFileSync('settings/api_keys.json', defaults.encoding))
// get methods for setting up command fields asynchronously
const { setCommandFields } = require('./helpers/setCommandFields')
// get methods for event helpers
const { latexInterpreter } = require('./helpers/latexInterpreter')
const { parseApprovalReaction } = require('./helpers/implementApprovalPolicy')
const { parseCustomCommand } = require('./helpers/parseCustomCommand')
const { rutgersChan } = require('./helpers/rutgersChan')
const { reroll } = require('./helpers/reroll')
const { checkWordCount } = require('./helpers/checkWordCount')
const { setupWinstonTransports } = require('./helpers/setupWinstonTransports')
// get method for looking into objects (used for error logging)
const { inspect } = require('util')
// set up winston logging
const winston = require('winston')
const logger = winston.createLogger()
setupWinstonTransports(logger)
// initialize the Discord client
const Commando = require('discord.js-commando')
const Client = new Commando.Client(ClientOptions)
/*  EVENTS  */
// emitted on error, warn, debug
Client.on('error', (info) => logger.log('error', info))
Client.on('commandError', (command, err, message, args, fromPattern, result) => {
    logger.log('error', 
`<b>Command:</b> ${message.guild.commandPrefix}${command.groupID}:${command.memberName} or ${message.guild.commandPrefix}${command.name}
<br><b>Guild:</b> ${message.guild.name}
<br><b>Error:</b> ${err.name}: ${err.message}
<br><b>Arguments:</b> ${inspect(args)}
<br><b>fromPattern:</b> ${fromPattern}
<br><b>Result:</b> ${result}`)
})
Client.on('warn', (info) => logger.log('warn', info))
Client.on('debug', (info) => logger.log('debug', info) )
Client.on('disconnect', () => logger.warn('Websocket disconnected!'))
Client.on('reconnecting', () => logger.warn('Websocket reconnecting...'))
Client.on('ready', () => { logger.log( 'info', `Logged onto as ${Client.user.tag}${` at ${new Date(Date.now())}.`}`) })

// emitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if( msg.author.bot )
        return

    // parse a custom command if the message starts with it, send the first word after the prefix to the method
    if( msg.cleanContent.startsWith(msg.guild && msg.guild.commandPrefix) )
        parseCustomCommand( msg.cleanContent.split(' ')[0].substring(msg.guild.commandPrefix.length), Client.provider, msg.channel )
    // check if message contains latex formatting, also suggest using latex formatting
    latexInterpreter( msg.cleanContent, msg.channel )
    // check if word counters need to be incremented
    checkWordCount( msg, Client.settings )
    // react with rutgerschan, do reroll
    rutgersChan( msg )
    reroll( msg )
})
// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by this bot
    if( user.id == Client.user.id )
        return

    // if the reaction was thumbs up approve, otherwise reject
    parseApprovalReaction( Client.provider, Client.users, messageReaction )

})

/*  CLEAN UP    */
// set up SettingsProvider
Client.setProvider(
    sqlite.open(
        path.join(__dirname, 'settings.sqlite3')
    )
    .then( db => new Commando.SQLiteProvider(db) )
    .catch( console.error )
)
// set up client's command registry
Client.registry
    .registerGroups([
        ['fun', 'Fun'],
        ['customcommands', 'Custom Commands'],
        ['emotes', 'Emotes'],
        ['quotes', 'Quotes'],
        ['soundboard', 'Soundboard'],
        ['information', 'Info'],
        ['config', 'Configure Server Settings'],
        ['settings', 'Settings'],
        ['verification', 'Verification']
    ])
    .registerDefaults()
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'))
// set some command fields asynchronously
setCommandFields(Client.registry)
// log in
Client.login(API_Keys.token)
