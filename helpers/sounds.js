const exec = require('child_process').execSync;

function getSoundsArr( humanReadable ) {
    const command = 'ls sounds';

    const soundsArr = exec(command)
        .toString()
        .split('\n')
        .map(str => str.split('.')[0])
        .filter(str => str !== '');

    const hrSoundsArr = `\n\`\`\`\n${
        soundsArr
            .join('\n')
    }\n\`\`\``;

    return humanReadable ? hrSoundsArr : soundsArr;
}

exports.getSoundsArr = getSoundsArr;
