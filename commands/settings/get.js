const Commando = require('discord.js-commando');
const util = require('util');

module.exports = class GetSettingCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'get-setting',
            group: 'settings',
            memberName: 'get',
            description: 'Get a setting in the settings provider for this guild in the CommandoClient.',
            examples: [ 'settings:get key', 'get-guild-setting approvalChannel' ],
            args: [
                {
                    key: 'key',
                    prompt: 'Enter the key for the setting you want to retrieve.',
                    type: 'string'
                },
                {
                    key: 'guild',
                    prompt: 'Do you want to get the setting for this guild?',
                    type: 'boolean'
                }
            ],
            argsPromptLimit: 1,
            ownerOnly: true
        });
    }

    async run( msg, { key, guild } ) {
        const value = guild ? this.client.provider.get( msg.guild, key ) : this.client.settings.get( key );

        return msg.reply( value ? 'Value: ```' + util.inspect(value) + '\n```' : `Could not get value by key, \`${key}\`, from settings.`, { split: true } );
    }
};
