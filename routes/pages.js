const express = require("express");
const router = express.Router();
const handlers = require("../handlers/pages");

router.get("/", handlers.home);
router.get("/login", handlers.login);
router.get("/judging", handlers.judging);
router.get("/admin", handlers.admin);
router.get("/profile", handlers.profile);

module.exports = router;
