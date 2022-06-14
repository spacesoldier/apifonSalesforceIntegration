'use strict'
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('message service')
                        .level(logLevels.INFO)
                    .build();

const {validateSfEvent} = require('./schemas');

/**
 *
 * @param {string} message
 * @returns {string} message
 */
function transformInvalidJSON(message){
    message = message.
                    replaceAll('}','"}').
                    replaceAll('{','{"').
                    replaceAll('=','":"');
    return message;
}

function receiveSalesForceEvent(msg){

    let salesForceMsgStr = msg.payload;

    if (validateSfEvent(salesForceMsgStr)){
        let salesForceMessage
        try{
            salesForceMessage = JSON.parse(transformInvalidJSON(salesForceMsgStr));
        } catch (ex){
            msg.payload = ex;
        }

    } else {
        msg.payload = `invalid input message: ${JSON.stringify(validateSfEvent.errors)}`;
    }


    return msg;
}

function onApifonSendResult(msg){

    return msg;
}

function onApifonSendError(msg){

}


module.exports = {
    receiveSalesForceEvent,
    onApifonSendResult,
    onApifonSendError
}
