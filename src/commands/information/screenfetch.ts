import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { execSync } from 'child_process';

export default class ScreenfetchCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'screenfetch',
            group: 'information',
            memberName: 'screenfetch',
            description: 'Run `screenfetch`.',
            hidden: true
        });
    }

    async run(msg: CommandoMessage) {
        return msg.channel.send(
            execSync('screenfetch -nN')
                .toString()
                .trim()
                .split('\n')
                .filter(line => line.trim() !== '' )
                .map(line => line.trim())
                .join('\n'), // this procedure removes non-important new lines and trims every line
            {
                split: true,
                code: 'bash'
            }
        );
    }
};
