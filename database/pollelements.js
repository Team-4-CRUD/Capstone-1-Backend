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
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = pollElements;
