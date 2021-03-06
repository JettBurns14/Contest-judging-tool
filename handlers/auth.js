// Thanks Ethan for the OAuth example, very helpful:
// https://github.com/EthanLuisMcDonough/ka-oauth-example

const db = require(process.cwd() + "/util/db");
const jwt = require("jsonwebtoken");
const OAuthClient = require("oauth-1-client");
const { createJWTToken, handleNext, jsonMessage } = require(process.cwd() + "/util/functions");
const { KA_CONSUMER_KEY, KA_CONSUMER_SECRET, PORT } = process.env;
const OAUTH_CALLBACK_PATH = `/api/auth/oauth_callback`;
const KA = "www.khanacademy.org";

const client = (() => {
    const callback = (
        process.env.APP_STATE === "dev"
        ? `http://localhost:${PORT}${OAUTH_CALLBACK_PATH}`
        : `https://council-judging-tool.herokuapp.com${OAUTH_CALLBACK_PATH}`
    );
    return new OAuthClient({
        key: KA_CONSUMER_KEY,
        secret: KA_CONSUMER_SECRET,
        apiHostName: KA,
        requestUrl: `https://${KA}/api/auth2/request_token?oauth_callback=${callback}`,
        accessUrl: `https://${KA}/api/auth2/access_token`
    });
})();

exports.connect = function(request, response, next) {
    if (request.decodedToken) {
        // If token
        return handleNext(next, 400, "You are already logged in");
    }
    // If no token, connect user like normal.
    client.requestToken()
        .then(r => `https://${KA}/api/auth2/authorize?oauth_token=${r.token}`)
        .then(url => response.json({ redirect_url: url }))
        .catch(err => handleNext(next, 400, "Problem while requesting token"));
}

exports.oauthCallback = function(request, response, next) {
    // URL has the query strings
    const { query } = request;
    if (query && query.oauth_token && query.oauth_token_secret && query.oauth_verifier) {
        // Get an access token.
        client.accessToken(
            query.oauth_token,
            query.oauth_token_secret,
            query.oauth_verifier
        ).then(r => {
            // r has "token", "tokenSecret", and "query".
            const { token, tokenSecret } = r;
            // Use access tokens to get user info.
            client.auth(token, tokenSecret)
                .get("/api/internal/user", { casing: "camel" })
                .then(httpResponse => httpResponse.body)
                .then(userInfo => {
                    // userInfo is object with user info.
                    let { nickname, email, username, kaid, avatarUrl } = userInfo;
                    db.query("SELECT * FROM whitelisted_kaids WHERE kaid = $1", [kaid], result => {
                        if (result.error) {
                            return handleNext(next, 400, "There was a problem while checking if this KAID is whitelisted");
                        }
                        // If row, truthy, kaid is whitelisted, move on.
                        if (result.rows.length) {
                            // let kaidNums = kaid.split("_")[1];
                            db.query("SELECT * FROM evaluator WHERE evaluator_kaid = $1", [kaid], result => {
                                if (result.error) {
                                    return handleNext(next, 400, "There was a problem while searching for this evaluator_kaid, please try again");
                                }
                                // If row, truthy, user exists, just log in.
                                if (result.rows.length) {
                                  if (result.rows[0].account_locked) {
                                    response.redirect("/login");
                                  } else {
                                      createJWTToken(kaid, token, tokenSecret)
                                        .then(jwtToken => {
                                            response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 31536000000) });
                                            response.redirect("/");
                                        })
                                        .catch(err => handleNext(next, 400, err.message));
                                  }
                                } else {
                                    // User doesn't exist, sign up.
                                    // Inserting this data would normally be dangerous, but Node.PG auto-sanitizes.
                                    // https://github.com/brianc/node-postgres/wiki/FAQ#8-does-node-postgres-handle-sql-injection
                                    db.query("INSERT INTO evaluator (logged_in, logged_in_tstz, dt_term_start, dt_term_end, email, username, nickname, evaluator_name, evaluator_kaid, avatar_url) VALUES (true, CURRENT_TIMESTAMP, null, null, $1, $2, $3, $4, $5, $6)", [email, username, nickname, nickname, kaid, avatarUrl], result => {
                                        if (result.error) {
                                            return handleNext(next, 400, "There was a problem creating your account, please try again");
                                        }
                                        // This user was just created, now get their ID.
                                        createJWTToken(kaid, token, tokenSecret)
                                            .then(jwtToken => {
                                                response.cookie("jwtToken", jwtToken, { expires: new Date(Date.now() + 31536000000) });
                                                response.redirect("/");
                                            })
                                            .catch(err => handleNext(next, 400, err.message));
                                    });
                                }
                            });
                        } else {
                            // Not whitelisted
                            response.redirect("/login");
                        }
                    });
                }).catch(err => handleNext(next, 400, "Problem with getting KA user info"));
        }).catch(err => handleNext(next, 400, "Problem while getting KA access token"));
    } else {
        handleNext(next, 400, "Bad request");
    }
}

exports.logout = function(request, response, next) {
    if (request.decodedToken) {
        // Get decoded user ID.
        return db.query("UPDATE evaluator SET logged_in = 'f' WHERE evaluator_id = $1", [request.decodedToken.evaluator_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem logging you out");
            }
            response.clearCookie("jwtToken");
            return response.redirect("/login");
        });
    }
    handleNext(next, 401, "You cannot logout if you are not logged in first, silly");
}
