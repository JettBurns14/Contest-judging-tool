const { handleNext } = require("../functions");

const hasBody = (request, response, next) => {
    if (request.method === "POST") {
        // Length > 0, true, else false.
        if (Object.keys(request.body).length) {
            return next();
        }
        return handleNext(next, 400, "No request body received");
    }
    next();
}

module.exports = hasBody;
