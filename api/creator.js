const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");

router.get("/:creator_id", async (req, res) => {
  const creatorId = req.params.creator_id;
  try {
    const pollForms = await PollForm.findAll({
      where: {
        creator_id: creatorId,
      },
      include: [
        {
          model: pollElements,
          as: "pollElements",
        },
      ],
    });

    res.json(pollForms);
  } catch (error) {
    console.error("Failed to get user's poll forms", error);
    res.status(500).send({ error: "Failed to Fetch all Poll Forms ❌" });
  }
});

module.exports = router;
