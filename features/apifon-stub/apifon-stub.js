'use strict'

const crypto = require('crypto');
const {loggerBuilder, logLevels} = require('starty');
const log = loggerBuilder()
                        .name('Apifon service stub')
                        .level(logLevels.INFO)
                    .build();




function prepareResponse(receivedText){

    let receiveMessage = JSON.parse(receivedText);
    let {subscribers} = receiveMessage;
    let {number} = subscribers[0];
    let stubResponseMessage = `{
                                  "request_id": "${crypto.randomUUID()}",
                                  "reference": "Campaign #216",
                                  "results": {
                                    "${number}": [{
                                        "message_id": "${crypto.randomUUID()}",
                                        "custom_id": "222",
                                        "length": ${receivedText.length},
                                        "short_code": "123456",
                                        "short_url": "https://apfn.eu/123456",
                                        "landing_pages" : {
                                            "apifon_lp" : {
                                                "short_code" : "123456",
                                                "short_url" : "https://apfn.eu/123456"
                                            }
                                        }
                                            }
                                    ]
                                  },
                                  "result_info": {
                                    "status_code": 200,
                                    "description": "OK"
                                  }
                                }`

    return stubResponseMessage;
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
 *          }} msg
 */
function apifonIMRequestStub(msg){

    let {request, payload} = msg;

    let headers = request.headers;

    log.info(`received a message: ${payload} with headers: ${JSON.stringify(headers)}`);

    msg.response.statusCode = 200;
    msg.payload = prepareResponse(payload);

    return msg;
}


module.exports = {
    apifonIMRequestStub
}
