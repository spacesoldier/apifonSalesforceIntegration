'use strict'

const eventDataMarker = 'com.infobip.event.data.';

function extractTemplateParams(sfMessage){
    let extractedParams = {};

    let {inArguments} = sfMessage;
    if (inArguments !== undefined){
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
    let {inArguments} = sfMessage;
    if (inArguments !== undefined){
        for (let element of inArguments){
            for (let key in element){
                if (key.includes(msgTemplateFieldName)){
                    msgTemplate = element[key];
                }
            }
        }
    }
    return msgTemplate;
}

function extractMessageDetails (sfMessage) {
    let template = extractMessageTemplate(sfMessage);

    let templateParams = extractTemplateParams(sfMessage);

    return {
        template,
        templateParams
    }
}

module.exports = {
    extractMessageDetails
}
