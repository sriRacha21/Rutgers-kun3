const Commando = require('discord.js-commando');
const { getSoundsArr } = require('../../helpers/sounds');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const Pagination = require('discord-paginationembed');

module.exports = class SoundsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'sounds',
            aliases: ['sound'],
            group: 'soundboard',
            memberName: 'sounds',
            description: "List all the sounds in the bot's soundboard.",
            args: [
                {
                    key: 'filter',
                    type: 'string',
                    prompt: '',
                    default: ''
                }
            ]
        });
    }

    async run( msg, { filter }) {
        const embeds = [];
        const sounds = getSoundsArr().filter(s => s.includes(filter));
        const soundsSize = sounds.length;
        const soundsPerPage = 30;
        let nextSounds = sounds.splice(0, soundsPerPage);
        let i = 0;

        while (nextSounds.length > 0) {
            const templateEmbed = generateDefaultEmbed({
                author: 'Sounds in soundboard',
                title: `${soundsSize} sounds found`,
                clientUser: this.client.user,
                msg: msg,
                page: {
                    current: ++i,
                    total: Math.ceil(soundsSize / soundsPerPage)
                }
            });
            embeds.push(templateEmbed.setDescription(nextSounds.map(s => `\`${s}\``).join(', ')));
            nextSounds = sounds.splice(0, soundsPerPage);
        }

        new Pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([msg.author.id])
            .setChannel(msg.channel)
            .build()
            .catch(err => {
                if (err) msg.channel.send(`I do not have the required permissions to create a paginated embed here. \`\`\`js\n${err}\n\`\`\``);
            });
    }
};
