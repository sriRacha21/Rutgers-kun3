const request = require('request-promise')

async function requestBreeds() {
    const req = await request("https://api.woofbot.io/v1/breeds")
    const json = JSON.parse(req)
    return json.response.breeds
}

exports.requestBreeds = requestBreeds;