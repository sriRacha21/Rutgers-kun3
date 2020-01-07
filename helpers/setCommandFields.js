const { requestBreeds } = require('./requestBreeds')

async function setCommandFields(registry) {
    /*  Set WOOF command oneOf array to available breeds  */
    const woofCommand = registry.commands
    .filter(command => command.name == 'woof' )
    .first()

    const firstWoofArg = woofCommand
    .argsCollector
    .args[0]

    const breeds = (await requestBreeds()).map( str => str.toLowerCase() )

    woofCommand.details += breeds.join(', ')
    firstWoofArg.oneOf.push( breeds )
}

exports.setCommandFields = setCommandFields;