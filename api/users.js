const express = require("express");
const router = express.Router();
const { User, PollForm } = require("../database");
const { authenticateJWT } = require("../auth");
// Create User Info
// Update logged-in user's info

// router.put("/UserInfo", authenticateJWT, async (req, res) => {
//   try {
//     const { firstName, lastName, email, profilePicture } = req.body;

//     const user = await User.findByPk(req.user.id);
//     if (!user) return res.status(404).send({ error: "User not found" });

//     user.firstName = firstName || user.firstName;
//     user.lastName = lastName || user.lastName;
//     user.email = email || user.email;
//     user.profilePicture = profilePicture || user.profilePicture;

//     await user.save();

//     res.status(200).send(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: "Failed to update user info" });
//   }
// });

// // users.js or auth.js
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Send the user's data (including profile image)
    res.send({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get all users... just for testing postman
router.get("/", async (req, res) => {
  try {
    const usersInfo = await User.findAll();
    res.status(200).send(usersInfo);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get users info" });
  }
});

// Get user by ID... just for testing postman
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get user" });
  }
});
router.patch("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { firstName, lastName, email, profilePicture } = req.body;

  // Log the received update data
  console.log("Received update data:", req.body);

  // Sanitize fields (convert empty strings to null)
  const updateData = {
    firstName: firstName?.trim() || null,
    lastName: lastName?.trim() || null,
    profilePicture: profilePicture?.trim() || null,
    updatedAt: new Date(),
  };

  // Only include email if it's non-empty
  if (email && email.trim() !== "") {
    updateData.email = email.trim();
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`User with id ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    await user.update(updateData);

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email already in use" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// router.get("my-votedPoll", authenticateJWT, async, (req, res) => {
//   try{
//     const

//   }catch(err){
//     console.error(err);
//     res.status(500).send({message: "No voted Polls found! "});
//   }
// })

module.exports = router;
