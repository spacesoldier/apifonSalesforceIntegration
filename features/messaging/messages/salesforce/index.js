'use strict'
const {parseSalesforceMessage} = require('./prepare');
const {extractMessageDetails, extractApifonParameters} = require('./extract');


module.exports = {
    parseSalesforceMessage,
    extractMessageDetails,
    extractApifonParameters
}
