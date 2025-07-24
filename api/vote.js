const express = require("express");
const router = express.Router();
const { Vote, VoteRank } = require("../database");
const { authenticateJWT } = require("../auth");

// Example POST /submit route
router.post("/submit", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { pollFormId, response } = req.body;

  if (!pollFormId || !Array.isArray(response)) {
    return res.status(400).json({ error: "Invalid submission" });
  }
  try {
    const vote = await Vote.create({
       user_Id: req.user.id,
      pollForm_id: pollFormId, 
      voterToken: generateVoterToken(), // Optional
    });

    const voteRanks = response.map((r) => ({
      vote_id: vote.vote_id,
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

function generateVoterToken() {
  return require("crypto").randomBytes(16).toString("hex");
}

module.exports = router;
