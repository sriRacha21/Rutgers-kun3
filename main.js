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
// get methods for setting up command fields asynchronously
const { setCommandFields } = require('./helpers/setCommandFields')
// get methods for event helpers
const { latexInterpreter, suggestLatex } = require('./helpers/latexInterpreter')
const { parseApprovalReaction } = require('./helpers/implementApprovalPolicy')
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

// emmitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if( msg.author.bot )
        return
    
    suggestLatex( msg )
    latexInterpreter( msg.cleanContent, msg.channel )
})
// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by this bot
    if( user.id == Client.user.id )
        return

    // if the reaction was thumbs up approve, otherwise reject
    parseApprovalReaction( Client.settings, Client.users, messageReaction )
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