const express = require("express");
const router = express.Router();
const { Vote, VoteRank, pollElements, PollForm } = require("../database");
const { authenticateJWT } = require("../auth");
const { authenticateJWTIfAvailable } = require("../auth");

const crypto = require("crypto");

function generateVoterToken() {
  return crypto.randomBytes(16).toString("hex");
}

// Route to check if the authenticated user has voted in a poll
router.get("/has-voted/:pollFormId", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pollFormId } = req.params;
    const vote = await Vote.findOne({
      where: { user_id: userId, pollForm_id: pollFormId },
    });

    res.json({ hasVoted: !!vote });
  } catch (err) {
    console.error("❌ Error in /has-voted:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/voted-polls", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const polls = await PollForm.findAll({
      include: [
        {
          model: Vote,
          where: { user_id: userId },
        },
      ],
    });

    res.json({ votedPolls: polls });
  } catch (err) {
    console.error("❌ Error in /voted-polls (alt):", err);
    res.status(500).json({ error: "Failed to fetch voted polls" });
  }
});

router.post("/submit", authenticateJWTIfAvailable, async (req, res) => {
  const userId = req.user?.id; // ✅ Optional chaining
  const { pollFormId, response } = req.body;

  if (!pollFormId || !Array.isArray(response)) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  const pollForm = await PollForm.findByPk(pollFormId);
  if (!pollForm) {
    return res.status(404).json({ error: "Poll not found" });
  }

  if (pollForm.disabled) {
    return res
      .status(403)
      .json({ error: "This poll is disabled and not accepting votes" });
  }

  //check is logged user can use
  if (pollForm.private && !req.user) {
    return res
      .status(401)
      .json({ error: "This poll is private. Please log in to vote." });
  }

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

    const ranks = response.map((r) => r.rank);
    const elements = response.map((r) => r.elementId);
    const maxRank = pollEle.length;

    if (ranks.some((rank) => rank < 1 || rank > maxRank)) {
      return res
        .status(400)
        .json({ error: "Ranks must be between 1 and " + maxRank });
    }

    if (new Set(ranks).size !== ranks.length) {
      return res.status(400).json({ error: "Duplicate ranks are not allowed" });
    }

    if (new Set(elements).size !== elements.length) {
      return res
        .status(400)
        .json({ error: "Duplicate elements in response are not allowed" });
    }

    const vote = await Vote.create({
      user_id: userId || null,
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
      const rounds = [];
      let activeCandidates = new Set(candidates);
      let roundNumber = 1;

      while (true) {
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
          // FIX: use activeCandidates (not candidates) to reflect eliminations
          const top = ballot.find((c) => activeCandidates.has(c));
          if (top) {
            tally[top]++;
            activeBallots++;
          }
        }

        rounds.push({
          round: roundNumber++,
          tally: { ...tally },
        });

        //lets check for winner, if anyone ovver 50%
        // turns your tally object into an array of [candidate, count] pairs
        // [ ["A", 2], ["B", 3], ["C", 1] ], 6 = activeBallots , 3 > 6/3 = 3 , no winner yet
        for (const [candidate, count] of Object.entries(tally)) {
          if (count > activeBallots / 2) {
            return {
              winner: candidate,
              rounds,
            };
          }
        }

        //This finds the smallest number of votes any candidate currently has in rank 1.
        const minVotes = Math.min(...Object.values(tally));
        //returns [candidate, count] pairs.
        const toEliminate = Object.entries(tally)
          //picks pair where it matches min vote
          .filter(([_, count]) => count === minVotes)
          //find the key it belongs to
          .map(([c]) => c);

        // Tie or all remaining candidates have same vote count
        if (toEliminate.length === activeCandidates.size) {
          return {
            winner: Array.from(activeCandidates),
            tie: true,
            rounds,
          };
        }

        // Eliminate lowest candidates
        for (const elim of toEliminate) activeCandidates.delete(elim);

        // If no one left, it's over
        if (activeCandidates.size === 0) {
          return {
            winner: null,
            tie: true,
            tiedCandidates: [],
            rounds,
          };
        }
      }
    };

    const result = InstantRunOff(ballots);
    if (result.rounds && result.rounds.length > 0) {
      result.votes = result.rounds[0].tally;
    }
    return res.json({ result });
  } catch (err) {
    console.error("❌ Error in /results:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/TotalVoteCast/:PollId", async (req, res) => {
  try {
    const pollId = req.params.PollId;

    const poll = await PollForm.findByPk(pollId);
    if (!poll) return res.status(404).send("Poll not found.");

    const totalVotes = await Vote.count({
      where: { pollForm_id: pollId }, // only count votes for this poll
    });

    res.status(200).send({
      pollId,
      title: poll.title,
      totalVotes,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Failed to get total votes for this poll" });
  }
});



module.exports = router;

