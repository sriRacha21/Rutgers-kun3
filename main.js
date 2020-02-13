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
const { objToEmailBody } = require('./helpers/objToEmailBody')
const { detectChain } = require('./helpers/detectChain')
const { agreeHelper } = require('./helpers/agreeHelper')
const { flushAgreements } = require('./helpers/flushAgreements')
const { checkRoleMentions } = require('./helpers/checkRoleMentions')
const { setLiveRole } = require('./helpers/setLiveRole')
const { flushLiveRoles } = require('./helpers/flushLiveRoles')
// set up winston logging
const logger = require('./logger')
// initialize the Discord client
const Commando = require('discord.js-commando')
const Client = new Commando.Client(ClientOptions)
/*  EVENTS  */
// emitted on error, warn, debug
Client.on('error', (error) => logger.log('error', `<b>Error</b>: ${error.name}: ${error.message}`))
Client.on('commandError', (command, err, message, args, fromPattern, result) => {
    logger.log('error', objToEmailBody({
        command: `${command.groupID}:${command.memberName} or ${command.name}`,
        guild: message.guild.name,
        error: `${err.name}: ${err.message}`,
        arguments: args,
        fromPattern: fromPattern,
    }))
})
Client.on('warn', (info) => logger.log('warn', info))
Client.on('debug', (info) => logger.log('debug', info) )
Client.on('disconnect', () => logger.warn('Websocket disconnected!'))
Client.on('reconnecting', () => logger.warn('Websocket reconnecting...'))
Client.on('ready', () => { 
    logger.log( 'info', `Logged onto as ${Client.user.tag}${` at ${new Date(Date.now())}.`}`)
    // periodically flush messages in #agreement in all servers
    flushAgreements( Client.guilds, Client.provider ) 
    // periodically flush the live role from users that aren't streaming
    flushLiveRoles( Client.guilds, Client.provider )
})

// emitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if( msg.author.bot )
        return

    // delete messages in #agreement if they're made by non-admins or bots
    if( msg.guild ) {
        const agreementChannel = Client.provider.get( msg.guild, `agreementChannel` )
        if( agreementChannel == msg.channel.id && (msg.author.bot || !msg.member.hasPermission(defaults.admin_permission)) )
            msg.delete()
    }

    // agreement process, we need the settings and settingsprovider to access guild and universal settings
    agreeHelper( msg, Client.guilds, Client.settings, Client.provider )
    // parse a custom command if the message starts with it, send the first word after the prefix to the method
    if( msg.cleanContent.startsWith(msg.guild && msg.guild.commandPrefix) )
        parseCustomCommand( msg.cleanContent.split(' ')[0].substring(msg.guild.commandPrefix.length), Client.provider, msg.channel )
    // check if message contains latex formatting, also suggest using latex formatting
    latexInterpreter( msg.cleanContent, msg.channel )
    // check if role has been mentioned
    checkRoleMentions( msg, Client.provider )
    // check if word counters need to be incremented
    checkWordCount( msg, Client.settings )
    // react with rutgerschan, do reroll
    rutgersChan( msg )
    reroll( msg )
    // detect chains
    detectChain( msg, Client.provider )
})

// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by this bot
    if( user.id == Client.user.id )
        return

    // if the reaction was thumbs up approve, otherwise reject
    parseApprovalReaction( Client.provider, Client.users, messageReaction )
})

// emitted on change of guild member properties
Client.on('presenceUpdate', (oldMember, newMember) => {
    setLiveRole( oldMember, newMember, Client.provider )
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
        ['moderation', 'Moderation'],
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
