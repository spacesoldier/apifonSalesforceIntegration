'use strict'

const {simpleIMRequestBodyBuilder} = require('./messages');

const crypto = require('crypto');

const apiEndpoint = '/services/api/v1/im/';
const url = `https://ars.apifon.com${apiEndpoint}`;

function prepareIMRequestHeaders(requestBody, apiKey, clientSecret){
    let requestDate = new Date().toUTCString();
    let message = "POST" + "\n"
                         + apiKey + "\n"
                         + requestBody + "\n"
                         + requestDate;

    let signature = crypto.createHmac('sha256', clientSecret).update(message).digest('base64');

    let requestHeaders = {
                                'Content-type': 'application/json',
                                'Authorization': 'ApifonWS ' + apiKey + ":" + signature,
                                'X-ApifonWS-Date': requestDate,
                        };

    return {
        ...(requestHeaders)
    }

}

/**
 *
 * @param {string} messageText
 * @param {object} apifonParams
 * @returns {{headers: {}, body: string}}
 */
function prepareSimpleIMRequest(messageText, apifonParams){

    let {apiKey, clientSecret, phone} = apifonParams;

    let error;
    let headers;
    let body;

    if (apiKey !== undefined && clientSecret !== undefined && phone !== undefined){
        let simpleIMRequest = simpleIMRequestBodyBuilder()
            .subscriber(phone)
            .text(messageText)
            .build();
        body = JSON.stringify(simpleIMRequest);

        headers = prepareIMRequestHeaders(body, apiKey,clientSecret);
    } else {
        error = 'not enough parameters';
    }


    return {
        error,
        headers,
        body
    }

}

module.exports = {
    prepareSimpleIMRequest
}