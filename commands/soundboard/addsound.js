const Commando = require('discord.js-commando')
const https = require('https')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
const path = require('path')
const { setPlayCommandFields, setAddSoundCommandFields } = require('../../helpers/setCommandFields')
const util = require('util')

module.exports = class AddSoundCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addsound',
            group: 'soundboard',
            memberName: 'add',
            description: 'Add a custom sound to the bot\'s soundboard',
            args: [
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Set a name for the sound.',
                    parse: str => `${str.toLowerCase()}.mp3`
                },
                {
                    key: 'sound',
                    label: 'attach .mp3 file',
                    type: 'sound',
                    prompt: 'Attach a sound file. .mp3\'s only.',
                }
            ],
            argsPromptLimit: 0
        })
    }

    async run( msg, { name, sound }) {
        // implementApprovalPolicy( msg.member.permissions.FLAGS, () => {}, () => {} )
        const filename = path.join(defaults.path, 'sounds', name )
        const file = fs.createWriteStream(path.join(defaults.path, 'sounds', name ))
        console.log( filename )
        // check if file exists before writing
        fs.access( filename, fs.constants.F_OK, err => {
            console.log( util.inspect( err ) ) 
            if( err ) {
                // write file to sounds folder
                https.get( sound.proxyURL, res => { res.pipe(file) })
                // set command fields for play and addsound to add the new sound
                setPlayCommandFields(this.client.registry)
                setAddSoundCommandFields(this.client.registry)

                msg.react( '👍' )
            } else
                msg.channel.send( 'Sound file could not be added because there is already a sound file by that name.' )
        })
    }
}