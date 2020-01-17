function getRandomInt( min, max ) { 
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomElement( arr ) {
    return arr[getRandomInt(0,arr.length)]
}

exports.getRandomInt = getRandomInt;
exports.getRandomElement = getRandomElement;