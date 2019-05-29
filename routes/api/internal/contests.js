/** Routes for CONTESTS handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/contests");
const { nameChars, datePattern, dateFormat } = require(process.cwd() + "/util/variables");

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/", [
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
], wasValidated, handlers.add);

router.put("/", [
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
], wasValidated, handlers.edit);

router.delete("/", [
    check("contest_id")
    .isInt()
    .withMessage("Contest ID must be an integer")
], wasValidated, handlers.delete);

module.exports = router;