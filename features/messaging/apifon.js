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

    if (apiResults !== undefined){
        msg.payload = {
            message_id: apiResults[0][0].message_id,
            contact_phone: apiResults[0].contact,
            status: apiResults[0].status_code,
        }
    }

    return msg;
}

function onApifonSendError(msg){
    msg.response.statusCode = 500;
    return msg;
}


module.exports = {
    receiveSalesForceEvent,
    onApifonSendResult,
    onApifonSendError
}
