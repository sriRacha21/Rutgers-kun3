/*  IMPORTS AND GENERAL SETUP   */
// import sqlite to use as SettingsProvider 
const sqlite = require('sqlite')
// import path to join paths in a platform-independent way
const path = require('path')
// prepare to read in data from JSON files
const fs = require('fs')
const default_encoding = 'utf-8'
// read in data from JSON file containing default settings for the bot (ClientOptions object)
const ClientOptions = JSON.parse(fs.readFileSync('default_settings.json', default_encoding))
// read in data from JSON file containing API keys
const API_Keys = JSON.parse(fs.readFileSync('api_keys.json', default_encoding))
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
// emitted when bot starts
Client.on('ready', () => {
    let outStr = "I'm alive! and running on " + __dirname
    console.log(outStr)
    Client.guilds.first().channels.first().send( outStr )
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
        ['fun', 'Fun']
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname,'commands'))
// log in
Client.login(API_Keys.token)