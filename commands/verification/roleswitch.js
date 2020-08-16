const Commando = require('discord.js-commando')

module.exports = class RoleSwitchCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'roleswitch',
            aliases: [ 'switchrole' ],
            group: 'verification',
            memberName: 'roleswitch',
            description: 'Switch between verified roles in this server.',
            args: [
                {
                    key: 'toRole',
                    label: 'role to switch to',
                    prompt: 'Enter the name of the role you want to switch to.',
                    type: 'role'
                }
            ],
            guildOnly: true
        })
    }


    async run( msg, { toRole } ) {
        // ensure the server has verification set up
        let agreementRoles = this.client.provider.get(msg.guild, 'agreementRoles');
        if( !agreementRoles || agreementRoles.length == 0 )
            return;
        agreementRoles = agreementRoles.filter(r => r.authenticate != 'permission')
        // ensure the user has one of the agreement roles
        let prevRole = -1;
        msg.member.roles.forEach(r => {
            if( prevRole == -1 && agreementRoles.map(r => r.roleID).includes(r.id) )
                prevRole = r.id;
        });
        if( prevRole == -1 )
            return;
        // convert role id's to roles
        prevRole = msg.guild.roles.get(prevRole);
            // toRole is already a role object
        if( !prevRole || !toRole )
            msg.channel.send("Uh oh. This shouldn't have happened."); // This should be impossible
        // make sure both roles are in the agreementRoles arr
        const agreementRolePrev = agreementRoles.find(r => r.roleID == prevRole.id);
        const agreementRoleTo = agreementRoles.find(r => r.roleID == toRole.id);
        if( !agreementRolePrev || !agreementRoleTo )
            msg.channel.send(`Make sure you enter one of these roles: ${agreementRoles.map(r => msg.guild.roles.get(r.roleID).name)}`);
        // if the role to switch to requires authentication and the previous role was authenticated (i.e. student to alum)
        if( agreementRolePrev.authenticate == 'true' && agreementRoleTo.authenticate == 'true' ) {
            // just remove the prev role and add the to role
            msg.guild.member.roles.remove(prevRole)
            msg.guild.member.roles.add(toRole)
        }
	}
}