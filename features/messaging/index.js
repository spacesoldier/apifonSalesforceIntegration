'use strict'

const {
    receiveSalesForceEvent,
    onApifonSendResult,
    onApifonSendError,
    prepareMessagingReport
} = require('./apifon');

module.exports = {
    receiveSalesForceEvent,
    onApifonSendResult,
    onApifonSendError,
    prepareMessagingReport
}