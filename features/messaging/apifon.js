'use strict'
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('message service')
                        .level(logLevels.INFO)
                    .build();

const {validateSfEvent} = require('./validate');
const {
            parseSalesforceMessage,
            extractMessageDetails,
            extractApifonParameters
        } = require('./messages/salesforce/');
const {prepareSimpleIMRequest} = require("./messages/apifon");



function fillMessageTemplate(messageTemplate, templateParams) {
    let messageToSend = messageTemplate;
    for (let paramName in templateParams) {
        if (messageToSend.includes(`%${paramName}%`)) {
            messageToSend = messageToSend.replaceAll(`%${paramName}%`, templateParams[paramName]);
        }
    }
    log.info(`message to Apifon: ${messageToSend}`);
    return messageToSend;
}


/**
 *
 * @param   {{  msgId:    string,
 *              request:  {headers: {object}},
 *              response: {object},
 *              payload:  {object}
 *          }} msg
 *
 * @returns {{  msgId:    string,
 *              request:  {headers: {object}},
 *              response: {headers:{object}},
 *              payload: {object},
 *              apifonMessageRequest:  {string}
 *          }} msg
 */
function receiveSalesForceEvent(msg){

    let {error,parsedMessage} = parseSalesforceMessage(msg);
    if (error !== undefined){
        msg.payload = `cannot send a message to Apifon due to an error: ${error}`;
    } else {
        if (parsedMessage !== undefined){
            if (validateSfEvent(parsedMessage)){

                let {templateParams, template} = extractMessageDetails(parsedMessage);

                let messageToSend;

                if (templateParams !== undefined && template !== undefined){
                    messageToSend = fillMessageTemplate(template, templateParams);
                }

                let apifonParams = extractApifonParameters(parsedMessage);

                let apifonMessage;
                if (messageToSend !== undefined){
                    apifonMessage = prepareSimpleIMRequest(messageToSend,apifonParams);
                }

                let {error, headers, body} = apifonMessage;

                if (error !== undefined){
                    msg.response.statusCode = 400;
                    msg.payload = "not enough data to send a message to Apifon: missing secrets";
                } else {
                    if (headers !== undefined && body !== undefined){
                        msg.request.headers = headers;
                        msg.apifonMessageRequest = body;
                    } else {
                        msg.response.statusCode = 400;
                        msg.payload = "not enough data to send a message to Apifon, could not set headers of prepare message body";
                    }
                }


            } else {
                msg.response.statusCode = 400;
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
