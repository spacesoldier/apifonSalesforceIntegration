'use strict'

const eventDataMarker = 'com.infobip.event.data.';

function extractArgsFromSfMessage(sfMessage){

    let result;

    let {msg} = sfMessage;

    if (msg !== undefined){
        let {inArguments} = msg;
        result = inArguments;
    }

    return result;
}

function extractTemplateParams(sfMessage){
    let extractedParams = {};

    let inArguments = extractArgsFromSfMessage(sfMessage);
    if (inArguments != undefined){
        for (let element of inArguments){
            for (let key in element){
                if (key.includes(eventDataMarker)){
                    let eventParamName = key.replace(eventDataMarker,'');
                    extractedParams[eventParamName] = element[key];
                } else {

                }
            }
        }
    }
    return extractedParams;
}

const msgTemplateFieldName = 'messageTemplate';

function extractMessageTemplate(sfMessage){
    let msgTemplate;
    let inArgs = extractArgsFromSfMessage(sfMessage);
    if (inArgs !== undefined){
        for (let element of inArgs){
            for (let key in element){
                if (key.includes(msgTemplateFieldName)){
                    msgTemplate = element[key];
                }
            }
        }
    }
    return msgTemplate;
}

module.exports = {
    extractTemplateParams,
    extractMessageTemplate
}
