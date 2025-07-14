const { DataTypes } = require("sequelize");
const db = require("./db");

const Vote = db.define("vote", {

    user_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

     Poll_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
     Element_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    frequency: {
         type: DataTypes.INTEGER,
         allowNull: true,
    }
    

});

module.exports = Vote;