const exec = require('child_process').execSync
const { requestBreeds } = require('./requestBreeds')

async function setCommandFields(registry) {
    setWoofCommandFields(registry)
    setPlayCommandFields(registry)
}

async function setWoofCommandFields(registry) {
    /*  Set woof command oneOf array to available breeds and set details    */
    const woofCommand = getCommandByName(registry, 'woof')

    const firstWoofArg = woofCommand
    .argsCollector
    .args[0]

    const breeds = (await requestBreeds()).map( str => str.toLowerCase() )

    woofCommand.details += `${breeds.join(', ')}. Choosing a breed is optional.`
    firstWoofArg.oneOf = breeds
}

async function setPlayCommandFields(registry) {
    /*  Set play command details and prompt */
    const playCommand = getCommandByName(registry, 'play')
    const command = 'ls sounds'
    
    const soundsArr = exec(command)
    .toString()
    .split('\n')

    const availSounds = `\n\`\`\`${
        exec(command)
        .toString()
    }\`\`\``

    playCommand
    .details += availSounds

    const firstPlayArg = playCommand
    .argsCollector
    .args[0]

    firstPlayArg
    .prompt += availSounds

    firstPlayArg
    .oneOf = soundsArr
}

function getCommandByName(registry, name) {
    const command = registry.commands
    .filter(command => command.name == name)
    .first()

    return command
}

exports.setCommandFields = setCommandFields