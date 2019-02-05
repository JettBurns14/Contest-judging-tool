const { validationResult } = require('express-validator/check');
const { handleNext } = require("../functions");

const wasValidated = (request, response, next) => {
    const errors = validationResult(request);
    // If errors is not empty.
    if (!errors.isEmpty()) {
        // If only one error, return its message.
        if (errors.array().length === 1) {
            return handleNext(next, 400, errors.array()[0].msg);
        }
        // If more than one error, return them all.
        else if (errors.array().length > 1) {
            let errorMessages = errors.array().map(err => err.msg);
            return handleNext(next, 400, errorMessages);
        }
    }
    next();
}

module.exports = wasValidated;
