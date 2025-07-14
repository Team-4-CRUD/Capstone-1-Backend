const { DataTypes } = require("sequelize");
const db = require("./db");


const PollForm = db.define("pollform", {

poll_id: {
    type: DataTypes.INTEGER,
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
},

creator_id: {
    type: DataTypes.INTEGER,
     allowNull: false,
},

creator_at: {
    type: DataTypes.FLOAT,
},
});

module.exports = PollForm;