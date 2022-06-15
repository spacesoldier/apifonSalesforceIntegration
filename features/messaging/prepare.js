'use strict'

const findOpenCurlBrace = /{(?![\s]+)/g;
const findCloseCurlBrace = /(?<!")}/g;
const findEqChar = /(?!.*[[])=/g;
const findAllFormatting = /([\s]+)/g;
const findCommaBeforeChar = /,(?=\w)/g;
const findCommaAfterChar = /(?<=\w),/g;
const findColon = /(?<=\w):(?=\W)/g;
const findLastCurlBrace = /{(?=\w)/g;
const findUnfinishedStr = /(?<=:")}/g;

const replacements = [
    {   find: '{},',                replaceWith: ''     },
    {   find: '"{',                 replaceWith: '{'    },
    {   find: '}"',                 replaceWith: '}'    },
    {   find: findOpenCurlBrace,    replaceWith: '{"'   },
    {   find: findEqChar,           replaceWith: '"="'  },
    {   find: '"="',                replaceWith: '":"'  },
    {   find: '=',                  replaceWith: ':'    },
    {   find: findAllFormatting,    replaceWith: ''     },
    {   find: findCloseCurlBrace,   replaceWith: '"}'   },
    {   find: findCommaBeforeChar,  replaceWith: ',"'   },
    {   find: findCommaAfterChar,   replaceWith: '",'   },
    {   find: findColon,            replaceWith: '":'   },
    {   find: findLastCurlBrace,    replaceWith: '{"'   },
    {   find: findUnfinishedStr,    replaceWith: '"}'   }
];

/**
 *
 * @param {string} message
 * @returns {string} message
 */
function transformToValidJSON(message){


    for (let replacement of replacements){
        message = message.replaceAll(replacement.find, replacement.replaceWith);
    }

    return message;
}

module.exports = {
    transformToValidJSON
}
