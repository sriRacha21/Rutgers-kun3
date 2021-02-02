const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class DevelopmentServerCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'devserver',
            aliases: [ 'developmentserver', 'fanclub', 'server', 'development', 'dev' ],
            group: 'information',
            memberName: 'devserver',
            description: 'Join the development server!'
        });
    }

    async run( msg ) {
        const embedInfo = {
            title: 'Join the development server!',
            clientUser: this.client.user,
            msg: msg
        };

        const embed = generateDefaultEmbed(embedInfo)
            .addField( 'Discord Server Link:', '[Click here to join.](https://discord.gg/YDEpNDV)' )
            .addField('Why should I join this server?', `* If you have questions regarding development or setup
* Feedback for current systems
* Suggestions for new features
* General small-scale bot discussion
* Bug reports`);

        return msg.reply( embed );
    }
};
