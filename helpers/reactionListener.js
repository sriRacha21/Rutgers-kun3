const Client = require('../main').Client
const EventEmitter = require('events')
class ReactionListener extends EventEmitter {}
const reactionListener = new ReactionListener()

exports.reactionListener = reactionListener