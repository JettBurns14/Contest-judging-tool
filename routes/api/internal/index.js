const express = require("express");
const router = express.Router();

const contestRoutes = require("./contests");
const entriesRoutes = require("./entries");
const judgingRoutes = require("./judging");
const messagesRoutes = require("./messages");
const usersRoutes = require("./users");
const winnersRoutes = require("./winners");

router.use("/contests", contestRoutes);

router.use("/entries", entriesRoutes);

// rename "evaluations"? Allows editing and deleting of evals...
router.use("/judging", judgingRoutes);

router.use("/messages", messagesRoutes);

router.use("/users", usersRoutes);

router.use("/winners", winnersRoutes);

module.exports = router;