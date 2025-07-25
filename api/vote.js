const express = require("express");
const router = express.Router();
const { Vote, VoteRank, pollElements, PollForm } = require("../database");
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
      return res
        .status(400)
        .json({ error: "Response contains invalid element IDs" });
    }

    // Validate ranks and duplicates
    const ranks = response.map((r) => r.rank);
    const elements = response.map((r) => r.elementId);
    const maxRank = pollEle.length;

    if (ranks.some((rank) => rank < 1 || rank > maxRank)) {
      return res
        .status(400)
        .json({ error: "Ranks must be between 1 and " + pollEle.length });
    }

    if (new Set(ranks).size !== ranks.length) {
      return res.status(400).json({ error: "Duplicate ranks are not allowed" });
    }

    if (new Set(elements).size !== elements.length) {
      return res
        .status(400)
        .json({ error: "Duplicate elements in response are not allowed" });
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

//get all the votes from the form

router.get("/results/:pollFormId", async (req, res) => {
  try {
    const { pollFormId } = req.params;

    // ✅ 1: assign to `votes`
    const votes = await Vote.findAll({
      where: { pollForm_id: pollFormId },
      include: [
        {
          model: VoteRank,
          include: [{ model: pollElements, as: "pollElement" }],
        },
      ],
    });

    // ✅ 2: Build ballots
    const ballots = [];
    for (const vote of votes) {
      if (!vote.voteRanks || !Array.isArray(vote.voteRanks)) continue;

      const sortedRanks = vote.voteRanks.sort((a, b) => a.rank - b.rank);
      const ballot = sortedRanks
        .map((vr) => vr.pollElement?.option)
        .filter(Boolean);

      if (ballot.length > 0) ballots.push(ballot);
    }

    if (ballots.length === 0) {
      return res.json({ message: "No valid ballots found" });
    }

    // ✅ 3: Instant Runoff
    const InstantRunOff = (ballots) => {
      let candidates = new Set(ballots.flat());
      let round = 1;

      while (true) {
        round++;
         // Initialize tally: each candidate starts with 0 votes this round
        const tally = {};
        for (const c of candidates) tally[c] = 0;
        //       tally = {
      //   A: 0,
      //   B: 0,
      //   C: 0,
      // }

      // It counts only the ballots that still have a valid current choice in this round.
        let activeBallots = 0;

        for (const ballot of ballots) {
            // .find reads through each ballot from index 0 onward,
        // and .has checks whether each candidate is still in the race
          const top = ballot.find((c) => candidates.has(c));
          if (top) {
            tally[top]++;
            activeBallots++;
          }
        }

         //lets check for winner, if anyone ovver 50%
      // turns your tally object into an array of [candidate, count] pairs
      // [ ["A", 2], ["B", 3], ["C", 1] ], 6 = activeBallots , 3 > 6/3 = 3 , no winner yet
        for (const [candidate, count] of Object.entries(tally)) {
          if (count > activeBallots / 2) return candidate;
        }

        //This finds the smallest number of votes any candidate currently has in rank 1.
        const minVotes = Math.min(...Object.values(tally));
          //returns [candidate, count] pairs.
        const toEliminate = Object.entries(tally)
        //picks pair where it matches min vote
          .filter(([_, count]) => count === minVotes)
          //find the key it belongs to 
          .map(([c]) => c);

        if (toEliminate.length === candidates.size) {
          return Array.from(candidates); // Tie
        }

        for (const elim of toEliminate) candidates.delete(elim);
        if (candidates.size === 0) return "No winner";
      }
    };

    const result = InstantRunOff(ballots);
    return res.json({ result });
  } catch (err) {
    console.error("❌ Error in /results:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
