'use strict'
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('message service')
                        .level(logLevels.INFO)
                    .build();

const {validateSfEvent} = require('./schemas');
const {transformToValidJSON} = require('./prepare');
const {extractTemplateParams, extractMessageTemplate} = require('./extract');

function receiveSalesForceEvent(msg){

    let salesForceMsgStr = msg.payload;

    let startTs = Date.now();
    salesForceMsgStr = transformToValidJSON(salesForceMsgStr);
    log.info(`transformation took ${Date.now() - startTs} ms`);

    let parsedMessage;

    try{
        parsedMessage = JSON.parse(salesForceMsgStr);
    } catch (ex){
        msg.payload = ex;
    }

    if (parsedMessage != undefined){
        if (validateSfEvent(parsedMessage)){

            let eventParams = extractTemplateParams(parsedMessage);
            let msgTemplate = extractMessageTemplate(parsedMessage);

            if (eventParams != undefined && msgTemplate !== undefined){
                let messageToSend = msgTemplate;
                for (let paramName in eventParams){
                    if (messageToSend.includes(`%${paramName}%`)){
                        messageToSend = messageToSend.replaceAll(`%${paramName}%`,eventParams[paramName]);
                    }
                }
                log.info(`message to Apifon: ${messageToSend}`);
                msg.payload = messageToSend;
            }
        } else {
            msg.payload = "not enough data to send a message to Apifon";
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
