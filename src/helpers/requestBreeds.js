const bent = require('bent');
const getJSON = bent('json');

async function requestBreeds() {
    const res = await getJSON('https://api.woofbot.io/v1/breeds');
    return res.response.breeds;
}

exports.requestBreeds = requestBreeds;
