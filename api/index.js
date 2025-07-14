const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollform = require("./PollForm");


router.use("/test-db", testDbRouter);
router.use("/PollForm", pollform);

module.exports = router;
