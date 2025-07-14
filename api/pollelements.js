const express = require("express");
const router = express.Router();
const { pollElements } = require("../database");

router.get("/", async (req, res) => {
    try {
       const Pollel =  await pollElements.findAll();
       console.log(`Found ${Pollel.length} Poll Elements`);
       res.status(200).send("Poll Elements have been Found!")
    } catch(err){
        console.log("error fetching all poll elements", err)
    }
})