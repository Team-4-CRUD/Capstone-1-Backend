const express = require("express");
const router = express.Router();
const { PollForm } = require("../database");



// get all pollforms 
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

// get pollform by id
router.get("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findAll();
        res.json({
        message: "you cooked again"
        })
    }
    catch {
 
    }

});

// patch a pollform by id 
router.patch("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findAll();
        res.json({
        message: "you cookin huh"
        })
    }
    catch {
 
    }

});


// delete a pollform by id
router.delete("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findAll();
        res.json({
        message: "pack em up"
        })
    }
    catch {
 
    }

});

// create a new poll form
router.post("/", async (req, res) => {

    try {
        const pollform = await PollForm.findAll();
        res.json({
        message: "create something =]"
        })
    }
    catch {
 
    }

});





module.exports = router;