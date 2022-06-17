'use strict'
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('message service')
                        .level(logLevels.INFO)
                    .build();

const {validateSfEvent} = require('./validate');
const {parseSalesforceMessage,extractMessageDetails} = require('./messages/salesforce/');

function receiveSalesForceEvent(msg){

    let {error,parsedMessage} = parseSalesforceMessage(msg);
    if (error !== undefined){
        msg.payload = `cannot send a message to Apifon due to an error: ${error}`;
    } else {
        if (parsedMessage !== undefined){
            if (validateSfEvent(parsedMessage)){

                let {templateParams, template} = extractMessageDetails(parsedMessage);

                if (templateParams !== undefined && template !== undefined){
                    let messageToSend = template;
                    for (let paramName in templateParams){
                        if (messageToSend.includes(`%${paramName}%`)){
                            messageToSend = messageToSend.replaceAll(`%${paramName}%`,templateParams[paramName]);
                        }
                    }
                    log.info(`message to Apifon: ${messageToSend}`);
                    msg.payload = messageToSend;
                }
            } else {
                msg.payload = "not enough data to send a message to Apifon";
            }
        }
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
