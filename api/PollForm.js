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
    res.status(500).send({ error: "Failed to fetch a specific task! ❌" });
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
    // 1. extract the different parameters from the request body (ex. title, description, option, info, picture)
    const { title, description, status, option, info, picture } = req.body;
    const PollId = await PollForm.findByPk();
    // 2. create a PollForm with the relevant data {title: title, description: description}
    const pollForms = await PollForm.create({
      title: title,
      description: description,
      status: status,
    });
    // 3. Create a PollElements with the relevant data
    const pollEl = await pollElements.create({
      option: option,
      info: info,
      picture: picture,
    });
    // const pollEl = await pollElements.create(req.body);
    res.status(201).send(pollForms, pollEl);
    // res.status(201).send(pollEl);
  } catch (error) {
    console.error(error);
    console.log("Fail to created Form! ❌");
    res.status(500).send({ error: "Failed to create poll form ❌" });
  }
});

module.exports = router;
