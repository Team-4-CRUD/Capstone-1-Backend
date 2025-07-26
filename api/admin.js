const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT } = require("../auth");
const { adminAuthenticate } = require("../auth");

router.delete("/:id", authenticateJWT, adminAuthenticate ,async (req, res) => {
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

router.get("/AllUsers", authenticateJWT, adminAuthenticate, async (req, res) => {
  try {
    const Users = await User.findAll();
    res.status(200).json(Users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get all users" });
  }
});

//maybe use to promote?
router.post("/admin/promote/:id", adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).send({ error: "User not found" });

    user.isAdmin = true;
    await user.save();

    res.send({ message: `User ${id} is now an admin`, user });
  } catch (error) {
    res.status(500).send({ error: "Server error promoting user" });
  }
});

module.exports = router;
