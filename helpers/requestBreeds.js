const bent = require('bent');
const getJSON = bent('json');

async function requestBreeds() {
    let res;
    try {
        res = await getJSON('https://api.woofbot.io/v1/breeds');
    } catch (err) {
        return undefined;
    }
    return res.response.breeds;
}

exports.requestBreeds = requestBreeds;
