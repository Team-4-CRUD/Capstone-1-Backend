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

    if (poll.disabled) {
      return res
        .status(403)
        .json({ error: "This poll has been disabled by an admin" });
    }

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

// Duplicate a poll and its elements
router.post("/:id/duplicate", authenticateJWT, async (req, res) => {
  try {
    const pollForm_id = req.params.id;
    const userId = req.user.id;

    const poll = await PollForm.findOne({
      where: { pollForm_id, creator_id: userId },
      include: [
        {
          model: pollElements,
          as: "pollElements",
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found or unauthorized" });
    }

    // Only copy the fields you want, not IDs or timestamps
    const pollData = poll.toJSON();
    const {
      pollForm_id: _oldId,
      createdAt,
      updatedAt,
      ...fieldsToCopy
    } = pollData;

    const newPoll = await PollForm.create({
      ...fieldsToCopy,
      status: "draft",
    });

    if (poll.pollElements && poll.pollElements.length > 0) {
      const newElements = poll.pollElements
        .filter((el) => el.option) // Only copy elements with a valid option
        .map((el, idx) => {
          const { pollElement_id, pollForm_id, createdAt, updatedAt, ...rest } =
            el;
          // Always ensure rest.option is a string
          rest.option = `${rest.option} (Copy ${Date.now()}_${idx})`;
          return { ...rest, pollForm_id: newPoll.pollForm_id };
        });
      await pollElements.bulkCreate(newElements);
    }

    res.json({ message: "Poll duplicated successfully", poll: newPoll });
  } catch (err) {
    console.error("Duplicate error:", err);
    res.status(500).json({ error: "Failed to duplicate poll" });
  }
});
module.exports = router;
