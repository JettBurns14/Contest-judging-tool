const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/pages");

router.get("/", handlers.home);
router.get("/login", handlers.login);
router.get("/judging", handlers.judging);
router.get("/admin/:page", handlers.admin);
router.get("/results/:contestId", handlers.results);
router.get("/entries/:contestId", handlers.entries)
module.exports = router;
