/** Routes for MESSAGES handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/messages");
const { datePattern, messageChars, contentChars, dateFormat } = require(process.cwd() + "/util/variables")

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/", [
    check("message_date")
    .matches(datePattern)
    .withMessage(`Message date must be a valid date ${dateFormat}`),
    check("message_title")
    .isLength(messageChars)
    .withMessage("Message title cannot be empty or longer than 100 characters"),
    check("message_content")
    .isLength(contentChars)
    .withMessage("Message content cannot be empty or longer than 5,000 characters"),
], wasValidated, handlers.add);

router.put("/", [
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
], wasValidated, handlers.edit);

router.delete("/", [
    check("message_id")
    .isInt()
    .withMessage("Message ID must be an integer")
], wasValidated, handlers.delete);

module.exports = router;