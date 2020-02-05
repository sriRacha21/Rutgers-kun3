// returns a value at least min and is less than max
function getRandomInt( min, max ) { 
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomElement( arr ) {
    return arr[getRandomInt(0,arr.length)]
}

function generateVerificationCode( numDigits ) {
    // default to 6 digit verification codes
    if( !numDigits ) numDigits = 6
    
    // generate a number between 0 and 999999 inclusive.
    let verificationCode = getRandomInt( 0, 1000000 ).toString()

    // append a 0 to the beginning of the code until it is 6 digits long.
    while( verificationCode.length < numDigits )
        verificationCode = `0${verificationCode}`

    return verificationCode
}

exports.getRandomInt = getRandomInt
exports.getRandomElement = getRandomElement
exports.generateVerificationCode = generateVerificationCode