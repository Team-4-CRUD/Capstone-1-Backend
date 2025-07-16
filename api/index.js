const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollform = require("./PollForm");
const pollelements = require("./pollelements");

router.use("/test-db", testDbRouter);
router.use("/PollForm", pollform);
router.use("/pollelements", pollelements);

module.exports = router;
