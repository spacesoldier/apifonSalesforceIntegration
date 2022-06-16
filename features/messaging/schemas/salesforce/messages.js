'use strict'

const salesForceEvent = {
    type: "object",
    properties: {
        inArguments: {type: "array"},
        outArguments: {type: "array"}
    },
    required: ["inArguments", "outArguments"],
    additionalProperties: true
}

module.exports = {
    salesForceEvent
}
