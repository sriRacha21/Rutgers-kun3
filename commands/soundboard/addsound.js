const Commando = require('discord.js-commando')
const https = require('https')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const path = require('path')
const { setPlayCommandFields, setAddSoundCommandFields } = require('../../helpers/setCommandFields')
const { implementApprovalPolicy } = require('../../helpers/implementApprovalPolicy')
const RichEmbed = require('discord.js').RichEmbed;

module.exports = class AddSoundCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addsound',
            group: 'soundboard',
            memberName: 'add',
            description: 'Add a custom sound to the bot\'s soundboard.',
            guildOnly: true,
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

    async run( msg, { name, sound } ) {
        implementApprovalPolicy(
            {
                type: 'sound',
                submissionName: name,
                member: msg.member,
                runHasPerms: () => {
                    const filename = path.join(process.cwd(), 'sounds', name )
                    const file = fs.createWriteStream(filename)
                    // write file to sounds folder
                    https.get( sound.proxyURL, res => { res.pipe(file) })
                    // set command fields for play and addsound to add the new sound
                    setPlayCommandFields(this.client.registry)
                    setAddSoundCommandFields(this.client.registry)
                    
                    msg.react( '👍' )
                },
                settings: this.client.provider,
                attachments: [ sound ],
                errChannel: msg.channel
            },
            {
                title: msg.author.tag,
                clientUser: this.client.user,
                msg: msg,
                startingEmbed: new RichEmbed()
                    .addField( 'Sound name:', name.split('.')[0] )
            }
        )
    }
}