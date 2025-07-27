const express = require("express");
const router = express.Router();
const { DraftVote } = require("../database");
const { authenticateJWT } = require("../auth");


router.patch("/save-draft", authenticateJWT, async (req, res) => {
  const { PollFormId, partialRes } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).send({ message: "Unauthorized " });
  }

  try {
    // Check if draft exists
    let draft = await DraftVote.findOne({
      where: {
        user_id: userId,
        pollForm_id: PollFormId,
      },
    });

    if (draft) {
      // Update existing draft
      draft.response = partialRes;
      await draft.save();
    } else {
      // Create new draft
      draft = await DraftVote.create({
        user_id: userId,
        pollForm_id: PollFormId,
        response: partialRes,
      });
    }

    return res.status(200).send({ message: "Draft saved" });
  } catch (err) {
    console.error("Error saving Draft", err);
    res.status(500).send({ message: "Server Error" });
  }
});

router.get("/draft/:pollFormId", authenticateJWT, async (req, res) => {
  const { pollFormId } = req.params; 
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).send({ message: "Unauthorized" }); 
  }

  try {
    const draft = await DraftVote.findOne({
      where: {
        user_id: userId,
        pollForm_id: pollFormId,
      },
    });

    if (!draft) {
      return res.status(404).send({ message: "No draft found" });
    }

    return res.status(200).json({ partialRes: draft.response }); 
  } catch (err) {
    console.error("Failed fetching draft", err);
    return res.status(500).send({ message: "Server Error" });
  }
});

module.exports = router;