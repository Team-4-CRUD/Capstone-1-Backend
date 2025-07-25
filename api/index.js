const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const pollform = require("./PollForm");
const pollelements = require("./pollelements");
const creator = require("./creator");
const vote = require("./vote");
const user = require("./users")

router.use("/test-db", testDbRouter);
router.use("/PollForm", pollform);
router.use("/pollelements", pollelements);
router.use("/creator", creator);
router.use("/vote", vote);
router.use("/users", user)

module.exports = router;
