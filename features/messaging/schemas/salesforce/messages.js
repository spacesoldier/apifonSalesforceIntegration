'use strict'

const salesForceEvent = {
    type: "string",
    properties: {
        msg: {type: "string"},
        dttm: {type: "string"}
    },
    required: ["msg", "dttm"],
    additionalProperties: false
}

module.exports = {
    salesForceEvent
}
