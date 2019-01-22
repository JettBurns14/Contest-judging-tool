const express = require("express");
const router = express.Router();
const handlers = require("../handlers/api");
const { check } = require('express-validator/check');

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

router.post("/judging", [
    check("entry_id").isInt().withMessage("Entry ID must be an integer"),
    check("creativity").isInt({ min: 0, max: 10 }).withMessage("Scores must be >= 0 and <= 10"),
    check("complexity").isInt({ min: 0, max: 10 }).withMessage("Scores must be >= 0 and <= 10"),
    check("quality_code").isInt({ min: 0, max: 10 }).withMessage("Scores must be >= 0 and <= 10"),
    check("interpretation").isInt({ min: 0, max: 10 }).withMessage("Scores must be >= 0 and <= 10"),
    check("skill_level").isIn(["Advanced", "Intermediate", "Beginner"])
], handlers.evaluateEntry);
router.post("/update-entries", handlers.updateEntries);

module.exports = router;
