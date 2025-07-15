const express = require("express");
const router = express.Router();
const { pollElements } = require("../database");

// get all poll elements 
router.get("/", async (req, res) => {
    try {
        const pollelements = await pollElements.findAll();
        res.json({
          message: "elements huh?"

        });
    }

    catch {

    }
});

// get poll elements by id
router.get("/:id", async (req, res) => {

    try {
        const pollelement = await pollElements.findAll();
        res.json({
        message: "you want that one ?"
        })
    }
    catch {
 
    }

});

// patch a poll elements by id 
router.patch("/:id", async (req, res) => {

    try {
        const pollelement = await pollElements.findAll();
        res.json({
        message: "remix that one "
        })
    }
    catch {
 
    }

});


// delete a poll elements by id
router.delete("/:id", async (req, res) => {

    try {
        const pollelement = await pollElements.findAll();
        res.json({
        message: "later"
        })
    }
    catch {
 
    }

});

// create a new poll element
router.post("/", async (req, res) => {

    try {
        const pollelement = await pollElements.findAll();
        res.json({
        message: "what we making ?"
        })
    }
    catch {
 
    }

});





module.exports = router;