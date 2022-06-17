'use strict'
const {parseSalesforceMessage} = require('./prepare');
const {extractMessageDetails} = require('./extract');

module.exports = {
    parseSalesforceMessage,
    extractMessageDetails
}
