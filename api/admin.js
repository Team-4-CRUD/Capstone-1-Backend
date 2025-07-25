const express = require("express");
const router = express.Router();
const { User } = require("../database");

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



module.exports = router;