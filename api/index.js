const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollform = require("./PollForm");
const pollelements = require("./pollelements");
const vote = require("./vote")

router.use("/test-db", testDbRouter);
router.use("/PollForm", pollform);
router.use("/pollElements", pollelements);
router.use("./vote", vote);

module.exports = router;
