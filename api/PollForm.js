const express = require("express");
const router = express.Router();
const { PollForm } = require("../database");

// get all pollforms
router.get("/", async (req, res) => {
  try {
    const pollForms = await PollForm.findAll();
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
    const pollForms = await PollForm.findByPk(req.params.id);

    if (!pollForms) {
      return res.status(404).send("Failed to load a specific Form! ❌");
    }

    res.status(200).send(pollForms);
  } catch (err) {
    console.error(err);
    console.log("Failed to fetch a specific Form! ❌");
    res.status(500).send({ error: "Failed to fetch a specific task! ❌" });
  }
});

// patch a pollform by id
router.patch("/:id", async (req, res) => {
  try {
    const pollForms = await PollForm.findAll();
  } catch {}
});

// delete a pollform by id
router.delete("/:id", async (req, res) => {
  try {
    const formId = await PollForm.findByPk(req.params.id);

    if (!formId) {
      return res.status(404).send("Fail to fetch specific task! ❌");
    }

    await formId.destroy();
    res.status(200).send("Deleted Form! ✅");
  } catch (err) {
    console.error(err);
    console.error("Fail to delete a specific form! ❌");
  }
});

// create a new poll form
router.post("/", async (req, res) => {
  try {
    const newForm = await PollForm.create(req.body);

    res.status(201).send("created a new form!✅", newForm);
  } catch (err) {
    console.error("Error Creating a Form! ❌");
    console.error(err);
  }
});

module.exports = router;
