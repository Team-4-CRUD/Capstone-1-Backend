const { DataTypes } = require("sequelize");
const db = require("./db");

const DraftVote = db.define("draftVote", {
  draft_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  pollForm_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "pollforms",
      key: "pollForm_id",
    },
  },
  response: {
    type: DataTypes.JSON, // save partial ballot data here
    allowNull: true,
  },
});

module.exports = DraftVote;