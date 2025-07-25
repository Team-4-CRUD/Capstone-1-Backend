const express = require("express");
const router = express.Router();
const { pollElements, PollForm } = require("../database");

// get all poll elements
router.get("/", async (req, res) => {
  try {
    const pollEl = await pollElements.findAll({ include: PollForm });
    res.status(200).send(pollEl);
  } catch (err) {
    console.error(err);
    console.error("Failed to get all Poll Elements ❌");
    res.status(404).send("Failed to Fetch all Poll Elements ❌");
  }
});

// get poll elements by id
router.get("/:id", async (req, res) => {
  try {
    const pollEl = await pollElements.findByPk(req.params.id, {
      include: PollForm,
    });
    if (!pollEl) {
      return res.status(404).send(`${req.params.id} can't be found! 💔`);
    }

    res.status(200).send(pollEl);
  } catch (err) {
    console.error(err);
    console.error("Failed to Fetch a specific Poll Element! ❌📝 ");
    res.status(404).send("Failed to Fetch a Poll Element!. ❌📝");
  }
});

// patch a poll elements by id
router.patch("/:id", async (req, res) => {
  try {
    const pollEl = await pollElements.findByPk(req.params.id);
    if (!pollEl) {
      return res.status(404).send(`${req.params.id} is not Found`);
    }

    const updatedPollEl = await pollEl.update(req.body);
    res.status(201).send(updatedPollEl);
  } catch (err) {
    console.error(err);
    console.log("Failed to update a poll Element! ❌");
    res.status(500).send({ error: "Failed to update poll element!" });
  }
});

// delete a poll elements by id
router.delete("/:id", async (req, res) => {
  try {
    const pollEl = await pollElements.findByPk(req.params.id);
    if (!pollEl) {
      return res.status(404).send("Failed to delete a Poll Element! ❌");
    }
    await pollEl.destroy();
    res.status(200).send(`Poll Element ${req.params.id} has been deleted! ✅`);
  } catch (err) {
    console.error(err);
    console.log("Failed to delete a Poll Element! ❌");
    res.status(500).send({ error: "Failed to delete a Poll Element! ❌" });
  }
});

// create a new poll element
// router.post("/", async (req, res) => {
//   try {
//     const pollEl = await pollElements.create(req.body);
//     res.status(201).send(pollEl);
//   } catch (err) {
//     console.error(err);
//     console.log("Failed to create a Poll Element! 📝❌");
//     res.status(500).send({ error: "Failed to create Poll Element! 💔📝" });
//   }
// });

module.exports = router;
