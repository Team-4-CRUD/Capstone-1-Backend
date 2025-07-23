const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollform = require("./PollForm");
const pollelements = require("./pollelements");
const creator = require("./creator")

router.use("/test-db", testDbRouter);
router.use("/PollForm", pollform);
router.use("/pollelements", pollelements);
router.use("/creator", creator);

module.exports = router;
