const { DataTypes } = require("sequelize");
const db = require("./db");


const PollForm = db.define("pollform", {

poll_id: {
    type: DataTypes.INTEGER,
},

title: {
    type: DataTypes.STRING
},

description: {
    type: DataTypes.STRING,
},

status: {
    type: DataTypes.BOOLEAN,
},

creator_id: {
    type: DataTypes.INTEGER,
},

creator_at: {
    type: DataTypes.FLOAT,
},
});

module.exports = PollForm;