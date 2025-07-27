const { DataTypes } = require("sequelize");
const db = require("./db");

const PollForm = db.define("pollform", {
  pollForm_id: {
    type: DataTypes.INTEGER,
    //needed in order to work as Id
    primaryKey: true,
    autoIncrement: true,
  },

  disabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  ended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
    type: DataTypes.ENUM("draft", "published", "ended"),
    defaultValue: "draft",
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

module.exports = PollForm;
