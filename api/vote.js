const express = require("express");
const router = express.Router();
const { Vote, VoteRank, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");

const crypto = require("crypto");

function generateVoterToken() {
  return crypto.randomBytes(16).toString("hex");
}

router.post("/submit", authenticateJWT, async (req, res) => {
  console.log("🔍 Authenticated user ID:", req.user.id);
  const userId = req.user.id;
  const { pollFormId, response } = req.body;

  if (!pollFormId || !Array.isArray(response)) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  try {
    // Fetch poll elements for validation
    const pollEle = await pollElements.findAll({
      where: { PollFormId: pollFormId },
    });
    const validElementIds = pollEle.map((e) => e.element_id);

    // Check for invalid element IDs in response
    const invalidElements = response.filter(
      (r) => !validElementIds.includes(r.elementId)
    );
    if (invalidElements.length > 0) {
      return res.status(400).json({ error: "Response contains invalid element IDs" });
    }

    // Validate ranks and duplicates
    const ranks = response.map((r) => r.rank);
    const elements = response.map((r) => r.elementId);
    const maxRank = pollEle.length;

    if (ranks.some((rank) => rank < 1 || rank > maxRank)) {
      return res.status(400).json({ error: "Ranks must be between 1 and " + pollEle.length });
    }

    if (new Set(ranks).size !== ranks.length) {
      return res.status(400).json({ error: "Duplicate ranks are not allowed" });
    }

    if (new Set(elements).size !== elements.length) {
      return res.status(400).json({ error: "Duplicate elements in response are not allowed" });
    }

    // Create vote record
    const vote = await Vote.create({
      user_id: userId,
      pollForm_id: pollFormId,
      voterToken: generateVoterToken(),
    });

    // Prepare voteRanks for bulk insert
    const voteRanks = response.map((r) => ({
      vote_id: vote.Vote_id,
      element_id: r.elementId,
      rank: r.rank,
    }));

    // Insert voteRanks
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

router.get("/results/:pollFormId", async (req, res) => {
  const { pollFormId } = req.params;

  if (!pollFormId || isNaN(parseInt(pollFormId))) {
    return res.status(400).send({ error: "Invalid poll form ID ❌" });
  }

  try {
    const results = await Vote.findAll({
      where: { pollForm_id: pollFormId },
      include: [
        {
          model: VoteRank,
          as: "voteRanks",
          include: [{ model: pollElements, as: "element" }],
        },
      ],
    });

    if (results.length === 0) {
      return res.status(404).send("No votes found for this poll form ❌");
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).send({ error: "Failed to fetch poll results ❌" });
  }
});


module.exports = router;
