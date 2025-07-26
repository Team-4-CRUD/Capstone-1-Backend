const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");
const sequelize = require("../database/db");

// get all pollforms
router.get("/", async (req, res) => {
  try {
    const pollForms = await PollForm.findAll({
      include: [
        {
          model: pollElements,
          as: "pollElements",
        },
      ],
    });
    res.status(200).send(pollForms);
  } catch (err) {
    res.status(500).send({ error: "Failed to get all Forms! ❌" });
    console.error(err);
    console.log("Failed to get all poll Forms! ❌");
  }
});

// get pollform by id
router.get("/:id", async (req, res) => {
  try {
    const pollForms = await PollForm.findByPk(req.params.id, {
      include: [
        {
          model: pollElements,
          as: "pollElements",
        },
      ],
    });

    if (!pollForms) {
      return res.status(404).send("Failed to load a specific Form! ❌");
    }

    res.status(200).send(pollForms);
  } catch (err) {
    console.error(err);
    console.log("Failed to fetch a specific Form! ❌");
    res.status(500).send({ error: "Failed to fetch a specific Form! ❌" });
  }
});

// patch a pollform by id
router.patch("/:id", authenticateJWT, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const pollForm = await PollForm.findByPk(req.params.id, {
      include: [{ model: pollElements, as: "pollElements" }],
      transaction,
    });

    if (!pollForm) {
      await transaction.rollback();
      return res.status(404).send("Poll form not found");
    }

    if (pollForm.disabled) {
      await transaction.rollback();
      return res.status(403).send("Poll form is disabled and cannot be edited");
    }

    // Update main poll form
    await pollForm.update(
      {
        title: req.body.title,
        description: req.body.description,
        private: req.body.private,
      },
      { transaction }
    );

    const pollFormId = pollForm.pollForm_id;

    const incomingElements = req.body.pollElements || [];

    // Find existing elements
    const existingElements = pollForm.pollElements;

    // Get list of IDs from frontend
    const incomingIds = incomingElements
      .filter((el) => el.element_id)
      .map((el) => el.element_id);

    // Delete any element not in incoming list
    const elementsToDelete = existingElements.filter(
      (existing) => !incomingIds.includes(existing.element_id)
    );

    for (const toDelete of elementsToDelete) {
      await pollElements.destroy({
        where: {
          element_id: toDelete.element_id,
          PollFormId: pollFormId,
        },
        transaction,
      });
    }

    // Now update or create elements
    for (const element of incomingElements) {
      if (element.element_id) {
        await pollElements.update(
          {
            option: element.option,
            info: element.info,
            picture: element.picture,
          },
          {
            where: {
              element_id: element.element_id,
              PollFormId: pollFormId,
            },
            transaction,
          }
        );
      } else {
        await pollElements.create(
          {
            option: element.option,
            info: element.info,
            picture: element.picture,
            PollFormId: pollFormId,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    res.send("Update successful");
  } catch (error) {
    await transaction.rollback();
    console.error("PATCH error:", error);
    res.status(500).send({ error: error.message });
  }
});

// delete a pollform by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).send({ error: "Invalid poll form ID ❌" });
  }

  try {
    const form = await PollForm.findByPk(req.params.id);

    if (!form) {
      return res.status(404).send("Fail to fetch specific Form! ❌");
    }

    await form.destroy();
    res.status(204).send("Deleted Form! ✅");
  } catch (err) {
    console.error(err);
    console.error("Fail to delete a specific form! ❌");
    res.status(500).send({ error: "Failed to delete poll form ❌" });
  }
});

// create a new poll form
router.post("/", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const { title, description, status, Element } = req.body;

    const pollForm = await PollForm.create(
      {
        title,
        description,
        status,
        creator_id: userId,
        pollElements: Element,
      },
      {
        include: [{ model: pollElements, as: "pollElements" }],
      }
    );

    res.status(201).send(pollForm);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create poll form ❌" });
  }
});

module.exports = router;
