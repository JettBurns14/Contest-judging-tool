/** Routes for ENTRIES handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/entries");
const { nameChars } = require(process.cwd() + "/util/variables")

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/", [
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer"),
    check("entry_url")
    .isURL()
    .withMessage("Entry url must be a valid URL"),
    check("entry_kaid")
    .isInt()
    .withMessage("Entry KAID must be an integer"),
    check("entry_title")
    .isLength(nameChars)
    .withMessage("Entry title cannot be empty or longer than 200 characters"),
    check("entry_author")
    .isLength(nameChars)
    .withMessage("Entry author cannot be empty or longer than 200 characters"),
    check("entry_level")
    .isIn(["Advanced", "Intermediate", "Beginner", "TBD"])
    .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'TBD'"),
    check("entry_votes")
    .isInt()
    .withMessage("Entry votes must be an integer"),
    check("entry_height")
    .isInt()
    .withMessage("Entry height must be an integer")
], wasValidated, handlers.add);

router.put("/", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer"),
    check("edited_level")
    .isIn(["Advanced", "Intermediate", "Beginner", "tbd"])
    .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'tbd'"),
], wasValidated, handlers.edit);

router.delete("/", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer"),
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer")
], wasValidated, handlers.delete);

router.post("/import", [
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer")
], wasValidated, handlers.import);

module.exports = router;