const { DataTypes } = require("sequelize");
const db = require("./db");
const pollElements = require("./pollelements"); // ✅ import the model

const voteRank = db.define("voteRank", {
  vote_rank_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  vote_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  element_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // references: {
    //   model: pollElements, // match the actual table name if using underscored
    //   key: "element_id", // make sure this matches the PK in pollElements
    // },
  },
  rank: {
    type: DataTypes.INTEGER,
  },
});

module.exports = voteRank;
