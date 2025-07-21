const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");

router.get('/my-polls', authenticateJWT, async (req, res) => {
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

module.exports = router;
