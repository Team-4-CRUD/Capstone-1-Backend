const { DataTypes } = require("sequelize");
const db = require("./db");

//primaryKey makes it the official ID, and autoIncrement automatically increases it.

const pollElements = db.define(
  "pollelements",
  {
    element_id: {
      type: DataTypes.INTEGER,
      //needed in order to work as Id
      primaryKey: true,
      autoIncrement: true,
    },
    PollFormId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    option: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clicked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  // option can exist across different PollFormIds, but within the same PollFormId the options must be unique.
  {
    indexes: [
      {
        unique: true,
        fields: ["PollFormId", "option"],
      },
    ],
  }
);

module.exports = pollElements;
