const log = (request, response, next) => {
    let time = new Date().toLocaleTimeString();
    // Log headers we're interested in.
console.log(`${time} Request received: {
    headers: {
        host: ${request.headers.host},
        referer: ${request.headers.referer},
        cookie: ${request.headers.cookie},
        user-agent: ${request.headers["user-agent"]}
    }
    info: {
        url: ${request.url}
        method: ${request.method}
    }
}`);
    next();
}

module.exports = log;
