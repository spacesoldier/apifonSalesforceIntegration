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

    if (validateSfEvent(salesForceMsgStr)){
        try{
            parsedMessage = JSON.parse(salesForceMsgStr);
        } catch (ex){
            msg.payload = ex;
        }

        let eventParams;
        let msgTemplate;
        if (parsedMessage != undefined){
            eventParams = extractTemplateParams(parsedMessage);
            msgTemplate = extractMessageTemplate(parsedMessage);
        }

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
