function isValidnetID( str ) {
    return str.match(/^[a-z]+[0-9]*$/i)
}

exports.isValidnetID = isValidnetID