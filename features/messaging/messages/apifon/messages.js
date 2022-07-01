'use strict'

function Subscriber(phNumber){

    const number = phNumber;

    return {
        number
    }

}

function subscriberBuilder(){
    let phNumber;

    function phoneNumber(number){
        phNumber = number;
        return this;
    }

    function build(){
        return new Subscriber(
            phNumber ?? ""
        );
    }

    return {
        phoneNumber,
        build
    }
}

//
// {
//     "message": {},
//     "callback_url": "",
//     "im_channels": [{
//     "sender_id": "Mookee",
//     "text": "50% discount on our membership fee if you renew your subscription today!"
// }
// ],
//     "subscribers": [{
//     "number": "306999999999"
// }
// ]
// }


function SimpleIMRequest (
    messageObj,
    callbackUrl,
    imChannelsList,
    subscribersList
){

    const message = messageObj;
    const callback_url = callbackUrl;
    const im_channels = imChannelsList;
    const subscribers = subscribersList;

    return {
        message,
        callback_url,
        im_channels,
        subscribers
    }

}

function simpleIMRequestBodyBuilder(){

    let msg;

    /**
     *
     * @param {object} msgObj
     * @returns this
     */
    function message(msgObj){
        msg = msgObj;
        return this;
    }

    let subscriberList = [];

    /**
     *
     * @param {object|string} newSubscriber
     * @returns this
     */
    function subscriber(newSubscriber){
        if (typeof newSubscriber === 'string' || newSubscriber instanceof String){
            subscriberList.push(
                subscriberBuilder().phoneNumber(newSubscriber).build()
            )
        } else {
            if ('number' in newSubscriber){
                subscriberList.push(newSubscriber);
            }
        }
        return this;
    }


    let imChannels = [];

    /**
     *
     * @param {string} textStr
     * @returns this
     */
    function text(textStr){
        imChannels.push({
            sender_id: 'Apifon Chat',
            text: textStr
        })
        return this;
    }

    let callBackUrl;

    /**
     *
     * @param {string} callUrl
     * @returns this
     */
    function callback_url(callUrl){
        callBackUrl = callUrl;
        return this;
    }

    function build(){
        return new SimpleIMRequest(
            msg ?? {},
            callBackUrl ?? '',
            imChannels,
            subscriberList
        )
    }

    return {
        callback_url,
        message,
        subscriber,
        text,
        build
    }
}

module.exports = {
    simpleIMRequestBodyBuilder
}
