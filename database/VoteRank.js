const { DataTypes } = require("sequelize");
const db = require("./db");

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
  },
  rank: {
    type: DataTypes.INTEGER,
  },
});

module.exports = voteRank;
