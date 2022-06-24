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

function extractApifonParameters (sfMessage){
    let paramNames = [
        'apiKey',
        'clientSecret',
        'phone',
        'imageUrl',
        'buttonUrl',
        'buttonText'
    ];
    let {inArguments} = sfMessage;

    let apifonParams = {};

    if (inArguments !== undefined){

        // let's convert an array of objects with single property
        // to an object which contain all these properties
        // and filter only those properties which are defined in the list above
        for (let property of inArguments){
            for (let key in property){
                if (paramNames.some(param => param === key)){
                    apifonParams[key] = property[key];
                }
            }
        }
    }

    return {
        ...(apifonParams)
    };
}

module.exports = {
    extractMessageDetails,
    extractApifonParameters
}
