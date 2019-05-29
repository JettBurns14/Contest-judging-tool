const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/auth");

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

router.post("/connect", handlers.connect);
router.get("/oauth_callback", handlers.oauthCallback);
router.post("/logout", handlers.logout);

module.exports = router;
