const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");

// get all pollforms
router.get("/", async (req, res) => {
  try {
    const pollForms = await PollForm.findAll({ include: pollElements });
    res.status(200).send(pollForms);
  } catch (err) {
    res.status(500).send({ error: "Failed to get all Forms! ❌" });
    console.error(err);
    console.log("Failed to get all poll Forms! ❌");
  }
});

// get pollform by id
router.get("/:id", async (req, res) => {
  try {
    const pollForms = await PollForm.findByPk(req.params.id, {
      include: pollElements,
    });

    if (!pollForms) {
      return res.status(404).send("Failed to load a specific Form! ❌");
    }

    res.status(200).send(pollForms);
  } catch (err) {
    console.error(err);
    console.log("Failed to fetch a specific Form! ❌");
    res.status(500).send({ error: "Failed to fetch a specific Form! ❌" });
  }
});

// patch a pollform by id
router.patch("/:id", async (req, res) => {
  try {
    const pollForms = await PollForm.findByPk(req.params.id);

    if (!pollForms) {
      return res.status(404).send("Failed to update Form! ❌");
    }

    const updatedForm = await pollForms.update(req.body);
    res.status(200).send(updatedForm);
  } catch (error) {
    console.error(error);
    console.log("Fail to update Form! ❌");
    res.status(500).send({ error: "Failed to update poll form ❌" });
  }
});

// delete a pollform by id
router.delete("/:id", async (req, res) => {
  try {
    const formId = await PollForm.findByPk(req.params.id);

    if (!formId) {
      return res.status(404).send("Fail to fetch specific Form! ❌");
    }

    await formId.destroy();
    res.status(204).send("Deleted Form! ✅");
  } catch (err) {
    console.error(err);
    console.error("Fail to delete a specific form! ❌");
    res.status(500).send({error: "Failed to delete poll form ❌" })
  }
});

// create a new poll form
router.post("/", async (req, res) => {
  try {
    const { title, description, status, option, info, picture } = req.body;

    const pollForm = await PollForm.create({ title, description, status });

    const pollEl = await pollElements.create({
      PollFormId: pollForm.pollForm_id,
      option,
      info,
      picture,
    });

    res.status(201).send({ pollForm, pollEl });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create poll form ❌" });
  }
});

module.exports = router;
