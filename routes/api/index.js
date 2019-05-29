const express = require("express");
const router = express.Router();

const internalRoutes = require("./internal/index.js");
// const publicRoutes = require("./public");
router.use("/internal", internalRoutes);
// router.use("/public", publicRoutes);

module.exports = router;