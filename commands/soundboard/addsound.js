const Commando = require('discord.js-commando');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { setPlayCommandFields, setAddSoundCommandFields } = require('../../helpers/setCommandFields');
const { implementApprovalPolicy } = require('../../helpers/implementApprovalPolicy');
const RichEmbed = require('discord.js').MessageEmbed;

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
                    error: 'The name of the file must be alphanumeric and less than or equal to 30 characters.',
                    validate: str => {
                        const matches = str.match(/([a-z]|[0-9]|[()_-]){1,30}/g);
                        return matches ? matches[0].length === str.length : false;
                    },
                    parse: str => `${str.toLowerCase()}.mp3`
                },
                {
                    key: 'sound',
                    label: 'attach .mp3 file',
                    type: 'sound',
                    prompt: 'Attach a sound file. .mp3\'s only.'
                }
            ]
        });
    }

    async run( msg, { name, sound } ) {
        implementApprovalPolicy(
            {
                type: 'sound',
                submissionName: name,
                member: msg.member,
                runHasPerms: () => {
                    const filename = path.join(process.cwd(), 'sounds', name );
                    const file = fs.createWriteStream(filename);
                    // write file to sounds folder
                    https.get( sound.proxyURL, res => res.pipe(file) );
                    // set command fields for play and addsound to add the new sound
                    setPlayCommandFields(this.client.registry);
                    setAddSoundCommandFields(this.client.registry);

                    msg.react( '👍' );
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
        );
    }
};
