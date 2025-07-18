const { DataTypes } = require("sequelize");
const db = require("./db");

//primaryKey makes it the official ID, and autoIncrement automatically increases it.

const pollElements = db.define("pollelements", {
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
    allowNull: false,
  },
  clicked: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = pollElements;
