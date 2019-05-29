/** Routes for WINNERS handlers **/

const express = require("express");
const router = express.Router();
const {
    check
} = require('express-validator/check');
const hasBody = require(process.cwd() + "/middleware/hasBody");
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const handlers = require(process.cwd() + "/handlers/api/internal/winners");
const vars = require(process.cwd() + "/util/variables")

router.use(hasBody);

router.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Docs for validation:
// https://github.com/chriso/validator.js#validators

router.post("/", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer")
], wasValidated, handlers.add);

router.delete("/", [
    check("entry_id")
    .isInt()
    .withMessage("Entry ID must be an integer")
], wasValidated, handlers.delete);

module.exports = router;