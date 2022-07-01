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

const apifonMessageCache = {};

function cacheMessage(msg, messageToSend, sendDateTime) {
    apifonMessageCache[msg.msgId] = {
        text: messageToSend ?? 'no text',
        send_dttm: sendDateTime ?? new Date().toUTCString()
    };
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

    let {error,parsedMessage} = parseSalesforceMessage(msg.payload);
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
                        cacheMessage(msg, messageToSend, headers['X-ApifonWS-Date']);
                        delete msg.payload;
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

//      "message_id":"String",
//      "send_dttm":"Date",
//      "status":"Number",
//      "contact_phone":"String",
//      "message_text":"String"

function onApifonSendResult(msg){
    let apifonResp;
    try {
        apifonResp = JSON.parse(msg.payload);
    } catch (ex){
        msg.statusCode = 500;
        msg.payload = ex;
    }


    let apiResults = [];
    if (apifonResp !== undefined){
        let {results, result_info} = apifonResp;
        if (results !== undefined){
            for (let key in results){
                apiResults.push({
                    contact: key,
                    ...(results[key]),
                    ...(result_info)
                });
            }

        }
    }

    let msgFromCache = apifonMessageCache[msg.msgId];

    let personalMessage;
    let sendDttm;
    if (msgFromCache !== undefined){
        personalMessage = msgFromCache.text;
        sendDttm = msgFromCache.send_dttm;
    }

    if (apiResults !== undefined){
        msg.payload = {
            message_id: apiResults[0][0].message_id,
            contact_phone: apiResults[0].contact,
            status: apiResults[0].status_code,
            message_text: personalMessage ?? '',
            send_dttm: sendDttm ?? new Date().toUTCString()
        }
    }

    delete apifonMessageCache[msg.msgId];

    msg.response.headers = {};
    msg.response.headers['content-type'] = 'application/json';
    msg.payload = JSON.stringify(msg.payload);

    return msg;
}

function onApifonSendError(msg){
    msg.response.statusCode = 500;
    log.info(`error from Apifon: ${msg.payload}`);
    return msg;
}


module.exports = {
    receiveSalesForceEvent,
    onApifonSendResult,
    onApifonSendError
}
