const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT } = require("../auth");
// Create User Info
router.post("/UserInfo", authenticateJWT, async (req, res) => {
  try {
    const username = `user_${req.user.id}`;
    console.log(username);
    const { firstName, lastName, email, profilePicture } = req.body;

    const userInfo = await User.create({
      username,
      firstName,
      lastName,
      email,
      profilePicture,
    });

    res.status(201).send(userInfo);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to create UserInfo" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const usersInfo = await User.findAll();
    res.status(200).send(usersInfo);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get users info" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get user" });
  }
});

module.exports = router;
