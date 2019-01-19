const jwt = require("jsonwebtoken");

const isLoggedIn = (request, response, next) => {
    const jwtToken = request.cookies.jwtToken;
    if (jwtToken) {
        jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                request.decodedToken = null;
                next();
            } else if (decoded && decoded.token) {
                // They are logged in.
                request.decodedToken = decoded;
                next();
            } else {
                request.decodedToken = null;
                next();
            }
        });
    } else {
        // They are not logged in.
        request.decodedToken = null;
        next();
    }
}

module.exports = isLoggedIn;
