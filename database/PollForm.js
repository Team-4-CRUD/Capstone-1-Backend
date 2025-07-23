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
    type: DataTypes.ENUM("draft", "published", "ended"),
    defaultValue: "draft",
  },

  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = PollForm;
