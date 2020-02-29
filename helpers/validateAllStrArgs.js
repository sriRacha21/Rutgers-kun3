function validateAllStrArgs( registry ) {
    registry.commands.filter(c => c.group.id != 'util').forEach( command => {
        if( command.argsCollector ) {
            command.argsCollector.args.forEach( arg => {
                if( arg.type && arg.type.id == 'string' && !arg.validator ) {
                    arg.error = 'Input must be 500 characters or less.'
                    arg.validator = str => str.length < 500
                }
            })
        }
    } )
}

exports.validateAllStrArgs = validateAllStrArgs