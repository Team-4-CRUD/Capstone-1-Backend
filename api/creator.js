const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");

router.get("/my-polls", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const pollForms = await PollForm.findAll({
      where: {
        creator_id: userId,
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

router.patch("/:id/publish", authenticateJWT, async (req, res) => {
  try {
    const pollForm_id = req.params.id;
    const userId = req.user.id;

    // Find poll and check ownership
    const poll = await PollForm.findOne({
       where: { pollForm_id, creator_id: userId }, 
    });

    if (!poll)
      return res.status(404).json({ error: "Poll not found or unauthorized" });

    // Update status to "published"
    poll.status = "published";
    await poll.save();

    res.json({ message: "Poll published successfully", poll });
  } catch (err) {
    console.error("Publish error:", err);
    res.status(500).json({ error: "Failed to publish poll" });
  }
});

router.patch("/:id/end", authenticateJWT, async (req, res) => {
  try {
    const pollForm_id = req.params.id;
    const userId = req.user.id;

    const poll = await PollForm.findOne({
      where: { pollForm_id, creator_id: userId },
    });

    if (!poll)
      return res.status(404).json({ error: "Poll not found or unauthorized" });

    poll.status = "ended"; 
    await poll.save();

    res.json({ message: "Poll ended successfully", poll });
  } catch (err) {
    res.status(500).json({ error: "Failed to end poll" });
  }
});


module.exports = router;
