'use strict'

const findFormatting = [
    /\s*(?=[{[])/g,
    /(?<=[{[])\s+/g,
    /(?<=[}])\s+/g,
    /\s+(?=\w+":")/g,
    /\s+(?="\w+)/g,
    /(?<=],)\s+/g,
    /\s+(?=})/g,
    /(?<=,)\s+(?=\w+=)/g
];

const findOpenCurlBrace = /{(?=\w+)/g;
const findCloseCurlBrace = [
    /(?<=[^\x00-\x7F])}/g,
    /(?<=\w)}/g
];

const findEqCharInKVPairs = [
    /=(?=\w+")/g,
    /=(?=[^\x00-\x7F])/g,
    /(?<=[\w+])=(?=[\w+])/g,
];

const findEqCharBeforeStructs = /=(?=[[{])/g;
const findCommaBeforeKey = /(?<![]|}]),(?=\w+":")/g;
const findCommaBeforeStructF = /(?<=[]|}]),(?=\w+":)/g;
const findEmptyValEq = /=(?=})/g;

const replacements = [
    {   find: findFormatting,           replaceWith: ''     },
    {   find: '{},',                    replaceWith: ''     },
    {   find: findOpenCurlBrace,        replaceWith: '{"'   },
    {   find: findCloseCurlBrace,       replaceWith: '"}'   },
    {   find: findEqCharInKVPairs,      replaceWith: '":"'  },
    {   find: findEqCharBeforeStructs,  replaceWith: '":'   },
    {   find: findCommaBeforeKey,       replaceWith: '","'  },
    {   find: findCommaBeforeStructF,   replaceWith: ',"'   },
    {   find: findEmptyValEq,           replaceWith: '":""' },
];

/**
 *
 * @param {string} message
 * @returns {string} message
 */
function transformToValidJSON(message){

    for (let replacement of replacements){
        if (replacement.find instanceof Array){
            for (let toReplace of replacement.find){
                message = message.replaceAll(toReplace, replacement.replaceWith);
            }
        } else {
            message = message.replaceAll(replacement.find, replacement.replaceWith);
        }

    }

    return message;
}

function parseSalesforceMessage(msg){
    let salesForceMsgStr = transformToValidJSON(msg.payload);

    let salesforceMessage;

    try{
        salesforceMessage = JSON.parse(salesForceMsgStr);
    } catch (ex){
        return {
            error: ex
        }
    }

    return {
        parsedMessage: salesforceMessage
    }
}

module.exports = {
    parseSalesforceMessage
}
