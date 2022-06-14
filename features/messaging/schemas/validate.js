'use strict'

const {salesForceEvent} = require('./salesforce');

const Ajv = require("ajv")
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}



const validateSfEvent = ajv.compile(salesForceEvent);


module.exports = {
    validateSfEvent
}