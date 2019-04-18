const express = require("express");
const router = express.Router();
const handlers = require("../handlers/api");
const {
    check
} = require('express-validator/check');
const hasBody = require("../middleware/hasBody");
const wasValidated = require("../middleware/wasValidated");
// ReGeX patterns
const kaidPattern = /^kaid\_[0-9]+$/;
const datePattern = /^(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])-[0-9]{4}$/;
const dateFormat = "MM-DD-YYYY";
// Character limits
const scoreChars = {
    min: 0,
    max: 10
};
const messageChars = {
    min: 1,
    max: 100
};
const nameChars = {
    min: 1,
    max: 200
};
const contentChars = {
    min: 1,
    max: 5000
};

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

// Whitelisted users //
router.post("/whitelistUser", [
    check("kaid")
    .matches(kaidPattern)
    .withMessage("kaid must have correct format")
], wasValidated, handlers.whitelistUser);

router.post("/removeWhitelistedUser", [
    check("kaid")
    .matches(kaidPattern)
    .withMessage("kaid must have correct format")
], wasValidated, handlers.removeWhitelistedUser);

router.post("/editUser", [
    check("edit_user_id")
    .isInt()
    .withMessage("User ID must be an integer"),
    check("edit_user_name")
    .isLength(nameChars)
    .withMessage("User name cannot be empty or longer than 200 characters"),
    check("edit_user_kaid")
    .matches(kaidPattern)
    .withMessage("User KAID must have correct format"),
    check("edit_user_is_admin")
    .isBoolean()
    .withMessage("Is admin must be true or false"),
    check("edit_user_account_locked")
    .isBoolean()
    .withMessage("Account locked must be true or false")
], wasValidated, handlers.editUser);

// Contests //
router.post("/addContest", [
    check("contest_name")
    .isLength(nameChars)
    .withMessage("Contest name cannot be empty or longer than 200 characters"),
    check("contest_author")
    .isLength(nameChars)
    .withMessage("Contest author cannot be empty or longer than 200 characters"),
    check("contest_current")
    .isBoolean()
    .withMessage("Current contest must be a boolean"),
    check("contest_url")
    .isURL()
    .withMessage("Must provide a valid contest URL"),
    check("contest_start_date")
    .matches(datePattern)
    .withMessage(`Must be a valid date ${dateFormat}`),
    check("contest_end_date")
    .matches(datePattern)
    .withMessage(`Must be a valid date ${dateFormat}`),
], wasValidated, handlers.addContest);

router.post("/editContest", [
    check("edit_contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer"),
    check("edit_contest_name")
    .isLength(nameChars)
    .withMessage("Contest name cannot be empty or longer than 200 characters"),
    check("edit_contest_author")
    .isLength(nameChars)
    .withMessage("Contest author cannot be empty or longer than 200 characters"),
    check("edit_contest_url")
    .isURL()
    .withMessage("Must provide a valid contest URL"),
    check("edit_contest_start_date")
    .matches(datePattern)
    .withMessage(`Start date must be a valid date ${dateFormat}`),
    check("edit_contest_end_date")
    .matches(datePattern)
    .withMessage(`End date must be a valid date ${dateFormat}`),
    check("edit_contest_current")
    .isBoolean()
    .withMessage("Current contest must be true or false")
], wasValidated, handlers.editContest);

router.post("/deleteContest", [
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer")
], wasValidated, handlers.deleteContest);

// Entries //
router.post("/editEntry", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer"),
    check("edited_level")
    .isIn(["Advanced", "Intermediate", "Beginner", "tbd"])
    .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'tbd'"),
], wasValidated, handlers.editEntry);

router.post("/deleteEntry", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer"),
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer")
], wasValidated, handlers.deleteEntry);

// Winners //
router.post("/addWinner", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer")
], wasValidated, handlers.addWinner);

router.post("/deleteWinner", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer")
], wasValidated, handlers.deleteWinner);

// Messages //
router.post("/addMessage", [
    check("message_date")
    .matches(datePattern)
    .withMessage(`Message date must be a valid date ${dateFormat}`),
    check("message_title")
    .isLength(messageChars)
    .withMessage("Message title cannot be empty or longer than 100 characters"),
    check("message_content")
    .isLength(contentChars)
    .withMessage("Message content cannot be empty or longer than 5,000 characters"),
], wasValidated, handlers.addMessage);

router.post("/editMessage", [
    check("message_id")
    .isInt()
    .withMessage("Message ID must be an integer"),
    check("message_date")
    .matches(datePattern)
    .withMessage(`Message date must be a valid date ${dateFormat}`),
    check("message_title")
    .isLength(messageChars)
    .withMessage("Message title cannot be empty or longer than 100 characters"),
    check("message_content")
    .isLength(contentChars)
    .withMessage("Message content cannot be empty or longer than 5,000 characters"),
], wasValidated, handlers.editMessage);

router.post("/deleteMessage", [
    check("message_id")
    .isInt()
    .withMessage("Message ID must be an integer")
], wasValidated, handlers.deleteMessage);

// Evaluting //
router.post("/submitEvaluation", [
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
], wasValidated, handlers.submitEvaluation);

router.post("/update-entries", handlers.updateEntries);

module.exports = router;