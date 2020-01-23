const Commando = require('discord.js-commando')

module.exports = class QueryCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'query',
            group: 'owner',
            memberName: 'query',
            description: 'Query the SQLite database directly.',
            examples: [
                'query',
                'query show tables;',
                'query select * from table-name',
            ],
            ownerOnly: true,
            args: [
                {
                    key: 'query',
                    label: 'SQL query',
                    prompt: 'Enter the SQL query you want to query the database with.',
                    type: 'string',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { query } ) {
        const data = this.client.provider.db.all(query)

        // pretty-print data with spacing of 2 and in a code block.
        return msg.channel.send( JSON.stringify(await data, null, 2), {code: 'json'} )
    }
}