const { DataTypes } = require("sequelize");
const db = require("./db");

const Vote = db.define("vote", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  PollFormId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  element_Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Vote;
