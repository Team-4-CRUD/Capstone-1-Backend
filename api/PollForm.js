const express = require("express");
const router = express.Router();
const { PollForm, pollElements } = require("../database");
const { authenticateJWT } = require("../auth");
const sequelize = require("../database"); // ✅ Sequelize instance


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
router.patch("/:id", async (req, res) => {
 const transaction = await db.transaction();

  try {
    // Use your primary key field name in findByPk
    const pollForm = await PollForm.findByPk(req.params.id, {
      include: [{ model: pollElements, as: "pollElements" }],
      transaction,
    });

    if (!pollForm) {
      await transaction.rollback();
      return res.status(404).send("Poll form not found");
    }

    const { title, description, status, pollElements } = req.body;

    // Update poll form fields
    await pollForm.update({ title, description, status }, { transaction });

    if (pollElements && Array.isArray(pollElements)) {
      const existingElements = pollForm.pollElements;
      // Extract existing element ids (using your element_id field)
      const existingIds = existingElements.map((el) => el.element_id);
      const incomingIds = pollElements
        .filter((el) => el.element_id)
        .map((el) => el.element_id);

      // Delete removed elements
      const toDeleteIds = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDeleteIds.length) {
        await pollElements.destroy({
          where: { element_id: toDeleteIds },
          transaction,
        });
      }

      // Update or create
      for (const el of pollElements) {
        if (el.element_id && existingIds.includes(el.element_id)) {
          // Update existing
          await pollElements.update(el, {
            where: { element_id: el.element_id },
            transaction,
          });
        } else {
          // Create new (make sure to set PollFormId to pollForm.pollForm_id)
          await pollElements.create(
            { ...el, PollFormId: pollForm.pollForm_id },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();

    // Reload and send updated form with elements
    const updatedForm = await PollForm.findByPk(req.params.id, {
      include: [{ model: pollElements, as: "pollElements" }],
    });
    res.status(200).json(updatedForm);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).send({ error: "Failed to update poll form" });
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
