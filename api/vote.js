const express = require("express");
const router = express.Router();
const { Vote, VoteRank, } = require("../database");
const { generateVoterToken } = require("./utils/token");
const { authenticateJWT } = require("../auth");

router.post("/submit", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { pollFormId, response } = req.body;

  // ✅ Validate input
  if (!pollFormId || !Array.isArray(response) || response.length === 0) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  try {
    // ✅ 1. Create the vote (one per user per pollForm)
    const vote = await Vote.create({
      user_id: userId,
      PollFormId: pollFormId,
      voterToken: voterToken || generateVoterToken(),
    });

    // ✅ 2. Create associated vote ranks
    const voteRanks = response.map((r) => ({
      vote_id: vote.vote_id,
      element_id: r.elementId,
      rank: r.rank,
    }));

    // ✅ 3. Bulk insert vote ranks
    const createdVoteRanks = await VoteRank.bulkCreate(voteRanks); // ✅ Fixed: VoteRanks → VoteRank

    res.status(201).json({
      message: "Vote and rankings submitted successfully ✅",
      vote,
      voteRanks: createdVoteRanks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit votes ❌" });
  }
});

module.exports = router;
