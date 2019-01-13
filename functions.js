const jwt = require("jsonwebtoken");
const db = require("./db");

exports.isLoggedIn = req => {
    const jwtToken = req.cookies.jwtToken;
    if (jwtToken) {
        return jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
            if (decoded && decoded.token) {
                // They are logged in.
                return true;
            }
        });
    }
    // They are not logged in.
    return false;
}

exports.createJWTToken = (kaidNums, token, tokenSecret) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM evaluator WHERE evaluator_kaid = $1", [kaidNums], result => {
            if (result.error) {
                throw new Error("There was a problem while searching for this evaluator_kaid, please try again");
            }
            let { evaluator_id, evaluator_name, evaluator_kaid, username, nickname, avatarUrl } = result.rows[0];
            let jwtToken = jwt.sign({
                evaluator_id,
                evaluator_name,
                evaluator_kaid,
                username,
                nickname,
                avatarUrl,
                token,
                tokenSecret
            }, process.env.SECRET_KEY);
            resolve(jwtToken);
        });
    });
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
