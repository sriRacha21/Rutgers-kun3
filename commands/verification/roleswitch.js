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
            return msg.channel.send("This server does not have email verification set up.");
        agreementRoles = agreementRoles.filter(r => r.authenticate != 'permission')
        // ensure the user has one of the agreement roles
        let prevRole = -1;
        msg.member.roles.forEach(r => {
            if( prevRole == -1 && agreementRoles.map(r => r.roleID).includes(r.id) )
                prevRole = r.id;
        });
        if( prevRole == -1 )
            return msg.channel.send("You do not have any of the roles set up for email verification in this server.");
        // if to role is a role that the member already has stop 
        if( msg.member.roles.has(toRole.id) )
            return msg.channel.send("You already have this role.")
        // convert role id's to roles
        prevRole = msg.guild.roles.get(prevRole);
            // toRole is already a role object
        if( !prevRole || !toRole )
            msg.channel.send("Uh oh. This shouldn't have happened."); // This should be impossible
        // make sure both roles are in the agreementRoles arr
        const agreementRolePrev = agreementRoles.find(r => r.roleID == prevRole.id);
        const agreementRoleTo = agreementRoles.find(r => r.roleID == toRole.id);
        if( !agreementRolePrev || !agreementRoleTo ) {
            msg.channel.send(`Make sure you enter one of these roles: ${agreementRoles.map(r => msg.guild.roles.get(r.roleID).name).join(', ')}`);
            return;
        }
        // if the previous role was not authenticated and the to role is
        if( agreementRolePrev.authenticate == 'false' && agreementRoleTo.authenticate == 'true' ) {
            msg.author.send(`In order to switch to ${toRole.name} you need to be authenticated through 2-step email verification.
Please enter your netID. Your netID is a unique identifier given to you by Rutgers that you use to sign in to all your Rutgers services. It is generally your initials followed by a few numbers.`)
                .then(m => {
                    this.client.settings.set(`agree:${msg.author.id}`, {
                        guildID: msg.guild.id,
                        roleID: toRole.id,
                        nowelcome: true,
                        removerole: prevRole.id,
                        step: 2
                    })
                    msg.channel.send("You've been DM'ed instructions on switching roles.")
                })
                .catch(err => {
                    if( err )
                        msg.channel.send(`Error: \`${err}\`
This may have happened because you are not accepting DM's.
Turn on DM's from server members:`, {files: ['resources/setup-images/instructions/notif_settings.png', 'resources/setup-images/instructions/dms_on.png']})
                })
        } else {
            // any other case
            // just remove the prev role and add the to role
            msg.member.removeRole(prevRole)
                .then(m => {
                    msg.member.addRole(toRole)
                        .then(m => msg.channel.send(`Successfully switched your role to ${toRole.name}.`))
                        .catch(e => {
                            if(e)
                                msg.channel.send(`Error adding role ${toRole.name}: ${e}. Please ensure the bot is above this role and has "Manage Roles" so it can manage it.`);
                        })
                    })
                .catch(e => {
                    if(e)
                        msg.channel.send(`Error removing role ${prevRole.name}: ${e}. Please ensure the bot is above this role and has "Manage Roles" so it can manage it.`);
                })
        }
    }
}