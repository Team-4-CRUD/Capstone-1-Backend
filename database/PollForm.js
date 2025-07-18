const { DataTypes } = require("sequelize");
const db = require("./db");

const PollForm = db.define("pollform", {
  pollForm_id: {
    type: DataTypes.INTEGER,
    //needed in order to work as Id
    primaryKey: true,
    autoIncrement: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = PollForm;
