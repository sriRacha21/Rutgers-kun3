const exec = require('child_process').execSync

function getSoundsArr( humanReadable ) {
    const command = 'ls sounds'

    const soundsArr = exec(command)
    .toString()
    .split('\n')
    .map(str => str.split('.')[0])

    const hrSoundsArr = `\n\`\`\`${
        soundsArr
        .join('\n')
    }\`\`\``

    return humanReadable ? hrSoundsArr : soundsArr
}

exports.getSoundsArr = getSoundsArr