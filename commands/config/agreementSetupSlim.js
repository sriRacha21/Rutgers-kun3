const Commando = require('discord.js-commando');
const fs = require('fs');
const defaultSettings = fs.existsSync('settings/default_settings.json') ? JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8')) : { err: true };
const logger = require('../../logger');
const permissions = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'));

module.exports = class Command extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'agreementsetupslim',
            aliases: ['agreementsetup', 'slimsetup', 'setupslim'],
            group: 'config',
            memberName: 'agreementsetupslim',
            description: 'Run this command to run a slim version of the agreement setup. Uses emote reaction to serve roles.',
            userPermissions: [ permissions.admin_permission ],
            args: [
                {
                    key: 'role',
                    prompt: 'Enter the name of the role you want to give to a user that verifies.',
                    type: 'role'
                },
                {
                    key: 'message',
                    label: 'Message to attach emote to.',
                    prompt: 'Enter the ID of the message you want to attach the role reaction emote to.',
                    type: 'message'
                }
            ],
            guildOnly: true
        });
    }

    async run( msg, { role, message }) {
        if (defaultSettings.err) { logger.log('error', 'No defaultSettings.json file was found. Unintended behavior may occur. Make sure you rename settings/defaultSettings.json.dist to settings/defaultSettings.json.'); }
        // check for default settings
        if ( !defaultSettings || !defaultSettings.agreementSetupSlimEmote ) { return msg.channel.send('There are no default settings! Add a `defaultSettings.json` into the settings folder and give it a `agreementSetupSlimEmote` field with the value being the ID for the emote you want to use for the emote reaction.'); }
        // keep the message in settings so we can retrieve it from cache
        const messagesToCache = this.client.settings.get('messagesToCache') ? this.client.settings.get('messagesToCache') : [];
        if (messagesToCache.filter(m => m.channel === message.channel.id && m.message === message.id).length === 0) {
            messagesToCache.push({
                channel: message.channel.id,
                message: message.id
            });
        }
        this.client.settings.set('messagesToCache', messagesToCache);
        // react to the message
        const emote = defaultSettings.agreementSetupSlimEmote;
        message.react(emote)
            .then(() => {
                this.client.provider.set( msg.guild, 'agreementSlim', {
                    message: message.id,
                    emote: emote,
                    role: role.id
                })
                    .then(() => {
                        msg.channel.send('Agreement message successfully set! You can now delete all the messages in this channel other than the agreement message itself.');
                    });
            })
            .catch(err => {
                if (err) { return msg.channel.send('I was not able to react to the message. Make sure reactions are allowed in this channel.'); }
            });
    }
};
