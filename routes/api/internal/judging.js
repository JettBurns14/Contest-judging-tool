/** Routes for JUDGING handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/judging");
const { scoreChars } = require(process.cwd() + "/util/variables");

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/submit", [
    check("entry_id")
    .isInt()
    .withMessage("entry_id must be an integer"),
    check("creativity")
    .isInt(scoreChars)
    .withMessage("creativity score must be >= 0 and <= 10"),
    check("complexity")
    .isInt(scoreChars)
    .withMessage("complexity score must be >= 0 and <= 10"),
    check("quality_code")
    .isInt(scoreChars)
    .withMessage("quality_code score must be >= 0 and <= 10"),
    check("interpretation")
    .isInt(scoreChars)
    .withMessage("interpretation score must be >= 0 and <= 10"),
    check("skill_level")
    .isIn(["Advanced", "Intermediate", "Beginner"])
    .withMessage("skill_level must be 'Advanced', 'Intermediate', or 'Beginner'")
], wasValidated, handlers.submit);

module.exports = router;