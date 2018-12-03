exports.checkAccess = req => {
    if (JSON.parse(JSON.stringify(req.cookies))[process.env.COOKIE_1]) {
        return true;
    }
    return false;
}

// Reduce repeated next() code.
exports.handleNext = (next, status, message) => {
    return next({
        status,
        message
    });
}

// Respond with JSON message.
exports.jsonMessage = (res, code, msg) => {
    return res.json({ code: code, message: msg });
}

module.exports = exports;
