const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const Pollelements = require("./pollelements");

router.use("/test-db", testDbRouter);
router.use("./pollelements", Pollelements);

module.exports = router;
