const express = require("express");
const router = express.Router();
const { PollForm, user } = require("../database");



// get all pollforms 
router.get("/", async (req, res) => {
    try {
        const pollforms = await PollForm.findAll();
        res.send(pollforms);
    }
    catch (error) {
        res.status(500).send({ error: "failed to fetch poll forms " });
    }
});

// get pollform by id
router.get("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findByPk(req.params.id);
        if (!pollform) {
            return res.status(404).json({ error: "poll not found" });
        }
        res.send(pollform);
    }
    catch (error) {
        console.error(error);
        console.log("Fail to get all Form!");
        res.status(500).send({ error: "Failed to get all poll form" });
    }

});

// patch a pollform by id 
router.patch("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findByPk(req.params.id);
        if (!pollform){
          return res.status(404).json({ error: "poll not found" });  
        }
        const updatedForm = await pollform.update(req.body);
        res.send(updatedForm);
    }
    catch (error) {
        console.error(error);
        console.log("Fail to update Form!");
        res.status(500).send({ error: "Failed to update poll form" });
    }

});


// delete a pollform by id
router.delete("/:id", async (req, res) => {

    try {
        const pollform = await PollForm.findByPk(req.params.id);
        if (!pollform) {
            return res.status(404).json({ error: "form not found" });
        }
        await pollform.destroy();
        res.status(204).send("deleted form!")
    }
    catch (error) {
        console.error(error);
        console.log("Fail to deletd Form!");
        res.status(500).send({ error: "Failed to delete poll form" });
    }

});

// create a new poll form
router.post("/", async (req, res) => {

    try {
        console.log(req.body);
        const { title, description, status, creator_at, creator_id } = req.body;
        const pollform = await PollForm.create({
            title,
            description,
            status,
            creator_at,
            creator_id,
        });
        res.status(201).send(pollform);
        console.log("Form has been created!");


    }
    catch (error) {
        console.error(error);
        console.log("Fail to created Form!");
        res.status(500).send({ error: "Failed to create poll form" });
    }

});





module.exports = router;