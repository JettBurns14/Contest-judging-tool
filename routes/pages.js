const express = require("express");
const router = express.Router();
const handlers = require(process.cwd() + "/handlers/pages");

router.get("/", handlers.home);
router.get("/login", handlers.login);
router.get("/judging", handlers.judging);
router.get("/results/:contestId", handlers.results);
router.get("/entries/:contestId", handlers.entries)
router.get("/admin/dashboard", handlers.adminDashboard);
router.get("/admin/contests", handlers.adminContests);
router.get("/admin/tasks", handlers.adminTasks);
router.get("/admin/users", handlers.adminUsers);
router.get("/admin/judging", handlers.adminJudging);
router.get("/admin/evaluations/:userId/:contestId", handlers.adminEvaluations);
router.get("/kb", handlers.kbHome);
router.get("/kb/article/:articleId", handlers.kbArticle);
module.exports = router;
