const express = require("express");
const router = express.Router();
const { Vote, VoteRank, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");

const crypto = require("crypto");

function generateVoterToken() {
  return crypto.randomBytes(16).toString("hex");
}

router.post("/submit", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { pollFormId, response } = req.body;

  if (!pollFormId || !Array.isArray(response)) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  // Validate element IDs belong to the poll form
  try {
    const pollEle = await pollElements.findAll({
      where: { PollFormId: pollFormId },
    });
    const validElementIds = pollEle.map((e) => e.element_id);

    const invalidElements = response.filter(
      (r) => !validElementIds.includes(r.elementId)
    );
    if (invalidElements.length > 0) {
      return res
        .status(400)
        .json({ error: "Response contains invalid element IDs" });
    }

    
    const vote = await Vote.create({
      user_id: userId,
      pollForm_id: pollFormId,
      voterToken: generateVoterToken(),
    });

    const voteRanks = response.map((r) => ({
      vote_id: vote.Vote_id,
      element_id: r.elementId,
      rank: r.rank,
    }));

    const createdRanks = await VoteRank.bulkCreate(voteRanks);

    res.status(201).json({
      message: "Vote and rankings submitted successfully ✅",
      vote,
      voteRanks: createdRanks,
    });
  } catch (err) {
    console.error("❌ Vote submit error:", err);
    res.status(500).json({ error: "Failed to submit votes ❌" });
  }
});

module.exports = router;
