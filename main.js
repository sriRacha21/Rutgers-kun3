/*        	IMPORTS AND GENERAL SETUP	        */
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
// string formatting
const { oneLine } = require('common-tags')
// get methods for event helpers
const { setCommandFields } = require('./helpers/setCommandFields')
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
const { logEvent } = require('./helpers/logEvent')
const { checkAutoverify } = require('./helpers/checkAutoverify')
const { sendRoleResponse } = require('./helpers/sendRoleResponse')
const { checkProtectedRole } = require('./helpers/checkProtectedRole')
const { validateAllStrArgs } = require('./helpers/validateAllStrArgs')
const { generatePresence } = require('./helpers/generatePresence')
const { removeInvites } = require('./helpers/removeInvites')
// set up winston logging
const logger = require('./logger')
// get some Discord fields we need
const RichEmbed = require('discord.js').RichEmbed
// initialize the Discord client
const Commando = require('discord.js-commando')
const Client = new Commando.Client(ClientOptions)
/*        	EVENTS	        */
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

// emitted on bot being ready to operate
Client.on('ready', () => { 
    logger.log( 'info', `Logged onto as ${Client.user.tag}${` at ${new Date(Date.now())}.`}`)
    // periodically flush messages in #agreement in all servers
    flushAgreements( Client.guilds, Client.provider ) 
    // periodically flush the live role from users that aren't streaming
    flushLiveRoles( Client.guilds, Client.provider )
    // periodically refresh command settings
    setCommandFields( Client.registry )
    // peridiocally update the bot's status
    generatePresence( Client, 0 )
})

// emitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if( msg.author.bot )
        return

    // delete messages in #agreement if they're made by non-admins or bots
    if( msg.guild ) {
        const agreementChannel = Client.provider.get( msg.guild, `agreementChannel` )
        if( agreementChannel == msg.channel.id ) {
            // ESCAPE and give the user their role if they entered the autoverify code
            if( checkAutoverify( msg, Client.provider ) ) return
            if( msg.author.bot || !msg.member.hasPermission(defaults.admin_permission) )
                msg.delete()
        }
    }

    // agreement process, we need the settings and settingsprovider to access guild and universal settings
    agreeHelper( msg, Client.guilds, Client.settings, Client.provider )
    // parse a custom command if the message starts with it, send the first word after the prefix to the method
    if( msg.cleanContent.startsWith(msg.guild && msg.guild.commandPrefix) )
        parseCustomCommand( msg
            .cleanContent
            .toLowerCase()
            .split(' ')[0]
            .substring(msg.guild.commandPrefix.length), Client.provider, msg.channel
        )
    // remove server invite links
    removeInvites( msg, Client )
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
    if( newMember.user.bot )
        return

    setLiveRole( oldMember, newMember, Client.provider )
})

// emitted on bot joining a guild
Client.on('guildCreate', guild => {
    // check if the server owner is still in the server
    if( guild.owner )
        guild.owner.user.send( oneLine`Hiya! I see you've decided to add me to your server! I have 
a bunch of commands to configure the server to your liking. Just type \`help\` and check out some 
of the commands in the \`Config\` group. If you have any questions please ask the writer of this bot, 
${Client.owners[0]}.` )
})

// emitted on bot leaving (or getting kicked) from a guild
Client.on('guildDelete', guild => {
    // clear all the settings for that guild
    Client.provider.clear( guild )
})

// emitted on member update
Client.on('guildMemberUpdate', (oldM, newM) => {
    if( newM.user.bot )
        return

    sendRoleResponse(oldM, newM, Client.provider)
    checkProtectedRole(oldM, newM, Client.provider, Client.user)
})

/*        	LOGGING	        */
// emitted when a member joins a server
Client.on('guildMemberAdd', member => {
    // log the event
    logEvent({
        embedInfo: {
            author: 'Member joined',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL,
            thumbnail: member.user.displayAvatarURL,
        },
        guild: member.guild,
        settings: Client.provider
    })
})

// emitted when a member leaves a server
Client.on('guildMemberRemove', member => {
    logEvent({
        embedInfo: {
            author: 'Member left',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL,
            thumbnail: member.user.displayAvatarURL
        },
        guild: member.guild,
        settings: Client.provider,
    })
})

// emitted when a message gets deleted
Client.on('messageDelete', message => {
    // ignore if not in guild
    if( !message.guild )
        return
    // ignore deletions by bots
    if( message.author.bot )
        return 

    const startEmbed = new RichEmbed()
    const extras = []
    if( message.content ) {
        startEmbed.addField( 'Message content:', message.content.length <= 1024 ? message.content : 'See above for text.' )
        if( message.content.length > 1024 )
            extras.push( `**Deleted:**\n${message.cleanContent}` )
    }
    startEmbed.addField( 'In channel:', message.channel )
    
    logEvent({
        embedInfo: {
            author: 'Message deleted by',
            title: message.author.tag,
            clientUser: Client.user,
            authorThumbnail: message.guild.iconURL,
            thumbnail: message.author.displayAvatarURL,
            startingEmbed: startEmbed,
        },
        guild: message.guild,
        settings: Client.provider,
        attachments: message.attachments.array().map(a => a.proxyURL)
    }, extras)
})

// emitted when a message gets edited
Client.on('messageUpdate', (oMsg, nMsg) => {
    // ignore if not in guild
    if( !oMsg.guild )
        return
    // ignore updates by bots
    if( oMsg.author.bot )
        return 

    const startEmbed = new RichEmbed()
    const extras = []
    if( oMsg.content ) {
        startEmbed.addField( 'Old message content:', oMsg.content.length <= 1024 ? oMsg.content : 'See above for text.' )
        if( oMsg.content.length > 1024 )
            extras.push( `**Old:**\n${oMsg.cleanContent}` )
    }
    if( nMsg.content ) {
        startEmbed.addField( 'New message content:', nMsg.content.length <= 1024 ? nMsg.content : 'See above for text.' )
        if( nMsg.content.length > 1024 )
            extras.push( `**New:**\n${nMsg.cleanContent}` )
    }
    startEmbed.addField( 'In channel:', oMsg.channel )

    logEvent({
        embedInfo: {
            author: 'Message edited by',
            title: oMsg.author.tag,
            clientUser: Client.user,
            authorThumbnail: oMsg.guild.iconURL,
            thumbnail: oMsg.author.displayAvatarURL,
            startingEmbed: startEmbed,
        },
        guild: oMsg.guild,
        settings: Client.provider,
        attachments: oMsg.attachments.array().map(a => a.proxyURL)
    }, extras)
})

/*        	CLEAN UP	        */
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
// set all string args to only take 500 chars max
validateAllStrArgs(Client.registry)
// log in
Client.login(API_Keys.token)
