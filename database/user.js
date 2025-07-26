const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const User = db.define("user", {
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
    },
  },

  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [3, 20],
    },
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [3, 20],
    },
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    // validate: {
    //   isEmail: true,
    // },
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   isUrl: true,
    // },
  },

  auth0Id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Instance method to check password
User.prototype.checkPassword = function (password) {
  if (!this.passwordHash) {
    return false; // Auth0 users don't have passwords
  }
  return bcrypt.compareSync(password, this.passwordHash);
};

// Class method to hash password
User.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = User;
