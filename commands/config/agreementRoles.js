const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { oneLine } = require('common-tags')

module.exports = class SetAgreementRolesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setagreementroles',
            group: 'config',
            memberName: 'setagreementroles',
            description: 'Configure the roles that people can choose from when they agree to enter the server.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'agreementRolesAndBools',
                    label: 'agreement roles',
                    prompt: oneLine`Enter the name of the role you want to designate as a 
role a user can add through \`!agree\`. Please format each of your responses as \`role name, true/false/permission\` where
true or false indicates whether or not the role will require netID authentication. The permission flag indicates a role that is
used solely for permissions and will be given alongside any other role supplied to this command. Only one of these is allowed.
Just enter \`clear\` followed by \`finish\` to clear the current setting.`,
                    type: 'string',
                    infinite: true,
                    parse: str => str.toLowerCase(),
                    validate: str => str.match(/^([a-z]| )+, (true|false|permission)$/i) || str=='clear'
                }
            ]
        })
    }

    async run( msg, { agreementRolesAndBools } ) {
        const agreementRoleObjs = []
        let permissionUsedCount = 0

        if( agreementRolesAndBools[0] == 'clear' )
            return this.client.provider.remove( msg.guild, `agreementRoles` )
            .then( msg.channel.send(`Agreement roles succcessfully cleared.`) )

        let failure = false
        agreementRolesAndBools.forEach( agreementRoleAndBool => {
            const roleAndBool = agreementRoleAndBool.split(', ')
            const agreementRole = roleAndBool[0]
            const authenticate = roleAndBool[1]

            // count the number of times permission is used
            permissionUsedCount += authenticate == 'permission' ? 1 : 0
            // if permission has been used twice or more, indicate an input failure state.
            if( permissionUsedCount > 1 )
                failure = 'Too many permission roles.'
            
            const roleToPush = msg.guild.roles.cache.find( role => role.name.toLowerCase() == agreementRole )
            if( !roleToPush )
                failure = 'One or more roles could not be found.'
            else {
                agreementRoleObjs.push({
                    roleID: roleToPush.id,
                    authenticate: authenticate
                })
            }
        })
        if( failure )
            return msg.channel.send( `Command could not be completed: ${failure}` )

        this.client.provider.set( msg.guild, `agreementRoles`, agreementRoleObjs )
        .then( msg.channel.send(`Agreement roles successfully set.`) )
    }
}