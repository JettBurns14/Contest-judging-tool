const express = require("express");
const router = express.Router();
const handlers = require("../handlers/api")

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

router.post("/judging", handlers.evaluateEntry);
router.post("/update-entries", handlers.updateEntries);

module.exports = router;