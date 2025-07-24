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

  user_Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  PollFormId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Vote;
