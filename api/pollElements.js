const express = require("express");
const router = express.Router();
const { pollElements, PollForm } = require("../database");

// get all poll elements
router.get("/", async (req, res) => {
  try {
    const PollElements = await pollElements.findAll();
    res.status(200).send(PollElements);
  } catch (err) {
    res.status(500).send({ error: "Failed to get all Elements! ❌" });
    console.error(err);
    console.log("Failed to get all poll Elements! ❌");
  }
});

// get poll elements by id
router.get("/:id", async (req, res) => {
  try {
    const PollElements = await pollElements.findByPk(req.params.id);

    if (!PollElements) {
      return res.status(404).send("Failed to load a specific Element! ❌");
    }
    res.status(200).send(PollElements);
  } catch (err) {
    console.error(err);
    console.log("Failed to fetch a specific Element! ❌");
    res.status(500).send({ error: "Failed to fetch a Element! ❌" });
  }
});

// patch a poll elements by id
router.patch("/:id", async (req, res) => {
  try {
    const PollElement = await pollElements.findByPk(req.params.id);

    if (!PollElement) {
      return res.status(404).json({ error: "Element not found" });
    }

    await PollElement.update(req.body);

    console.log("Updated element was successful ✅");
    res.status(200).json(PollElement);
  } catch (error) {
    console.error("Error during update:", error); 
    res.status(500).json({ error: "Failed to update poll Element ❌" });
  }
});

// delete a poll elements by id
router.delete("/:id", async (req, res) => {
  try {
    const PollElements = await pollElements.findByPk(req.params.id);
    if (!PollElements) {
      return res.status(404).send("Element not found ❌");
    }
    await PollElements.destroy();
    res.status(204).send({ message: "Element deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete poll element ❌" });
  }
});

// create a new poll element
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const { PollFormId, title, description, clicked, picture, created_at } =
      req.body;
    const PollElements = await pollElements.create({
      PollFormId,
      title,
      description,
      clicked,
      picture,
      created_at,
    });
    res.status(201).send(PollElements);
    console.log("Form has been created! ✅");
  } catch (error) {
    console.error(error);
    console.log("Fail to created Element! ❌");
    res.status(500).send({ error: "Failed to create poll Element ❌" });
  }
});

module.exports = router;
