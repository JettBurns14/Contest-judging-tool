const {
    handleNext
} = require(process.cwd() + "/util/functions");

const hasBody = (request, response, next) => {
    if ((request.method === "POST" ||
        request.method === "PUT" ||
        request.method === "DELETE") &&
        request.url.indexOf("auth") === -1) {

        // Length > 0, true, else false.
        if (Object.keys(request.body).length) {
            return next();
        }
        return handleNext(next, 400, "No request body received");
    }
    next();
}

module.exports = hasBody;