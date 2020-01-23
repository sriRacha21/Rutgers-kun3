/*  IMPORTS AND GENERAL SETUP   */
// import sqlite to use as SettingsProvider 
const sqlite = require('sqlite')
// import path to join paths in a platform-dependent way
const path = require('path')
// prepare to read in data from JSON files
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
// read in data from JSON file containing default settings for the bot (ClientOptions object)
const ClientOptions = JSON.parse(fs.readFileSync('bot_settings.json', defaults.encoding))
// read in data from JSON file containing API keys
const API_Keys = JSON.parse(fs.readFileSync('api_keys.json', defaults.encoding))
// get method for setting up command fields asynchronously
const { setCommandFields } = require('./helpers/setCommandFields')
// initialize the Discord client
const Commando = require('discord.js-commando')
const Client = new Commando.Client(ClientOptions)

/*  EVENTS  */
// emitted on error, warn, debug
Client.on('error', console.error)
Client.on('warn', console.warn)
Client.on('debug', console.debug)
Client.on('disconnect', () => console.warn('Websocket disconnected!'))
Client.on('reconnecting', () => console.warn('Websocket reconnecting...'))

// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by the bot
    if( user.id == Client.user.id )
        return;

    // check if message is in the approval and run the containing function if its there
    const approvalInfo = Client.settings.get(`request:${messageReaction.message.id}`)
    if( approvalInfo ) {
        // find user by ID
        const userToDM = Client.users.find( u => u.id == approvalInfo.userToNotify )
        Client.settings.remove(`request:${messageReaction.message.id}`)
        // unable to find user, don't dm but continue adding the sound
        if( !userToDM )
            console.warn( `Cache miss on user ID: ${approvalInfo.userToNotify}! Ignoring...` )
        if( messageReaction.emoji.name == '👍' ) {
            approvalInfo.approveRequest()
            if( userToDM )
                userToDM.send( approvalInfo.messageToSend + 'approved.' )
        }
        if( messageReaction.emoji.name == '👎' ) {
            if( userToDM )
                userToDM.send( approvalInfo.messageToSend + 'rejected.' )
        }
    }
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
        ['customcommands', 'Custom Comamnds'],
        ['information', 'Info'],
        ['soundboard', 'Soundboard'],
        ['settings', 'Settings'],
        ['owner', 'Owner-Only Commands']
    ])
    .registerDefaults()
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'))
// set some command fields asynchronously
setCommandFields(Client.registry)
// log in
Client.login(API_Keys.token)