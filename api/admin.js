const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT } = require("../auth");

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to delete user" });
  }
});

router.get("/AllUsers", authenticateJWT, async (req, res) => {
  try {
    const Users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get all users" });
  }
});

module.exports = router;
