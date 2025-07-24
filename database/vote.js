const { DataTypes } = require("sequelize");
const db = require("./db");

const Vote = db.define("vote", {
  Vote_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  voterToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // optional: prevent duplicate token votes
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
});

module.exports = Vote;
