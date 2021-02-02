const Commando = require('discord.js-commando');

module.exports = class QueryCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'query',
            group: 'settings',
            memberName: 'query',
            description: 'Query the SQLite database directly. Only table name is `settings`.',
            examples: [
                'query',
                'query show tables;',
                'query select * from table-name'
            ],
            args: [
                {
                    key: 'query',
                    label: 'SQL query',
                    prompt: 'Enter the SQL query you want to query the database with.',
                    type: 'string'
                }
            ],
            argsPromptLimit: 1,
            ownerOnly: true
        });
    }

    async run( msg, { query } ) {
        const data = await this.client.provider.db.all(query);

        // pretty-print data with spacing of 2 and in a code block.
        return msg.reply( JSON.stringify(data, null, 2), { code: 'json', split: true } );
    }
};
