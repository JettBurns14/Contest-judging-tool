const {
    handleNext
} = require(process.cwd() + "/util/functions");

const hasBody = (request, response, next) => {
    if (request.method === "POST" && request.url.split("/")[1] !== "auth") {
        // Length > 0, true, else false.
        if (Object.keys(request.body).length) {
            return next();
        }
        return handleNext(next, 400, "No request body received");
    }
    next();
}

module.exports = hasBody;