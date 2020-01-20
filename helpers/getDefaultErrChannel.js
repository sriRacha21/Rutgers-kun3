function getDefaultErrChannel( maybeErrChannel, guildSettings ) {
    return maybeErrChannel ? maybeErrChannel : guildSettings.get( 'defaultErrChannel' )
}

exports.getDefaultErrChannel = getDefaultErrChannel