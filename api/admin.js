const express = require("express");
const router = express.Router();
const { User, PollForm } = require("../database");
const { authenticateJWT } = require("../auth");
const { adminAuthenticate } = require("../auth");
const { Op } = require("sequelize");

router.post(
  "/disable-user/:id",
  authenticateJWT,
  adminAuthenticate,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).send({ error: "User not found" });

      user.disabled = true;
      await user.save();

      res.send({ message: `User ${user.username} has been disabled`, user });
    } catch (error) {
      console.error("Disable user error:", error);
      res.status(500).send({ error: "Failed to disable user" });
    }
  }
);

router.get(
  "/AllUsers",
  authenticateJWT,
  adminAuthenticate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where: {
          username: {
            [Op.iLike]: `%${search}%`,
          },
          disabled: false,
        },
        limit,
        offset,
      });

      res.status(200).json({
        users: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to get all users" });
    }
  }
);

router.post(
  "/disablePoll/:id",
  adminAuthenticate,
  authenticateJWT,
  async (req, res) => {
    try {
      const poll = await PollForm.findOne({
        where: {
          id: req.params.id,
          disabled: false, // only fetch if not disabled
        },
      });

      if (!poll) return res.status(404).send({ error: "Poll not found or disabled" });

      poll.disabled = true; // or poll.isDisabled = true; depending on your model

      await poll.save();

      res.send({
        message: `Poll form ${poll.title || poll.id} has been disabled`,
        poll,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to disable form" });
    }
  }
);

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
