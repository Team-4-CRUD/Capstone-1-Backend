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
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user); // username will be whatever was saved, hopefully a string
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get user" });
  }
});

router.patch("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const updateData = req.body; // fixed typo here

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    if (err.code === 'P2025') {
      // Prisma error code for record not found
      return res.status(404).json({ message: "User not found" });
    }
    console.error("Error updating user: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
