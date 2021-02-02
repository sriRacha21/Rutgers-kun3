async function getCommandList( db, guild, errMessage ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve, reject) => {
        // get all settings
        const settings = await db.all( 'SELECT * FROM settings' );
        // filter settings to just this guild
        const guildSettings = settings.filter( setting => setting.guild === +guild.id );
        // if there are no settings at all in this guild there won't even be a row.
        if ( guildSettings.length === 0 ) {
            reject(errMessage);
            return;
        }
        // get custom commands
        const customCommands = JSON.parse( guildSettings[0].settings );
        // get keys and filter them
        const keys = Object.keys(customCommands)
            .filter( key => key.startsWith('commands:') )
            .map( key => key.substring('commands:'.length) );
        // resolve with the list of keys
        resolve(keys);
    });
}

module.exports = { getCommandList };
