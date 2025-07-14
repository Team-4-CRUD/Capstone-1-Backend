const express = require("express");
const router = express.Router();
const { PollForm } = require("../database");

router.get("/", async (req, res) => {
    try {
        const pollforms = await PollForm.findAll();
        res.json({
          message: "you cooked up cuhh"

        });
    }

    catch {

    }






});

module.exports = router;