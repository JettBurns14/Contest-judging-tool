/** Routes for USERS handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/users");
const { kaidPattern, nameChars} = require(process.cwd() + "/util/variables")

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/whitelist", [
    check("kaid")
    .matches(kaidPattern)
    .withMessage("kaid must have correct format")
], wasValidated, handlers.add);

router.delete("/whitelist", [
    check("kaid")
    .matches(kaidPattern)
    .withMessage("kaid must have correct format")
], wasValidated, handlers.delete);

router.put("/", [
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
], wasValidated, handlers.edit);

module.exports = router;