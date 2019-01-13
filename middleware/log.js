const log = (request, response, next) => {
    let time = new Date().toLocaleTimeString();
    console.log(`
${time}  -  ${request.method} ${request.url}`
    );
    next();
}

module.exports = log;
