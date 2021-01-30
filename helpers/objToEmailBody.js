const { inspect } = require('util');

function objToEmailBody( obj ) {
    let retStr = '';

    for ( const field in obj ) { retStr += `<b>${field.charAt(0).toUpperCase() + field.slice(1)}:</b> ${inspect(obj[field])}<br>`; }

    return retStr;
}

exports.objToEmailBody = objToEmailBody;
