const { requestBreeds } = require('./requestBreeds')
const { getSoundsArr } = require('./sounds')
const { getCommandByName } = require('./registryUtility')

async function setCommandFields(registry) {
    setWoofCommandFields(registry)
    setPlayCommandFields(registry)
    setAddSoundCommandFields(registry)
}

async function setWoofCommandFields(registry) {
    /*  Set woof command oneOf array to available breeds and set details    */
    const woofCommand = getCommandByName(registry, 'woof')

    const firstWoofArg = woofCommand
    .argsCollector
    .args[0]

    const breeds = (await requestBreeds()).map( str => str.toLowerCase() )

    woofCommand.details = `Output a picture of a cute dog chosen at random. Available breeds are: ${breeds.join(', ')}. Choosing a breed is optional.`
    firstWoofArg.oneOf = breeds
}

async function setPlayCommandFields(registry) {
    /*  Set play command details and prompt */
    const playCommand = getCommandByName(registry, 'play')

    // manipulate details of play command
    playCommand
    .details = `Available sounds:${getSoundsArr(true)}`

    // manipulate fields of first arg of play command
    const firstPlayArg = playCommand
    .argsCollector
    .args[0]

    firstPlayArg
    .prompt = `Enter the name of a sound file. Available sounds are:${getSoundsArr(true)}`

    firstPlayArg
    .oneOf = getSoundsArr()
}

async function setAddSoundCommandFields(registry) {
    /*  Set addsound command details    */
    const addSoundCommand = getCommandByName(registry, 'addsound')

    addSoundCommand.details = `Sounds so far are:${getSoundsArr(true)}`
}

exports.setCommandFields = setCommandFields
exports.setWoofCommandFields = setWoofCommandFields
exports.setPlayCommandFields = setPlayCommandFields
exports.setAddSoundCommandFields = setAddSoundCommandFields