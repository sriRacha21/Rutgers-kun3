function timeStrToMillis( str ) {
    const weeks = +str.match(/\d+(?=w)/i)
    const days = +str.match(/\d+(?=d)/i)
    const hours = +str.match(/\d+(?=h)/i)
    const minutes = +str.match(/\d+(?=m)/i)
    const seconds = +str.match(/\d+(?=s)/i)

    const millis = (weeks * 7 * 24 * 60 * 60 * 1000)
    + (days * 24 * 60 * 60 * 1000)
    + (hours * 60 * 60 * 1000)
    + (minutes * 60 * 1000)
    + (seconds * 1000)

    return millis
}

exports.timeStrToMillis = timeStrToMillis