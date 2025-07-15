const db = require("./db");
const pollElements = require("./pollelements");
const User = require("./user");
const PollForm = require("./PollForm");
const Vote = require("./vote");

//Associations 🎂

//Create Form
User.hasMany(PollForm, { foreignKey: "creator_id" });
PollForm.belongsTo(User, { foreignKey: "creator_id" });

PollForm.hasMany(pollElements, { foreignKey: "PollFormId" });
pollElements.belongsTo(PollForm, { foreignKey: "PollFormId" });

// For voting
User.hasMany(Vote, { foreignKey: "user_Id" });
Vote.belongsTo(User, { foreignKey: "user_Id" });

PollForm.hasMany(Vote, { foreignKey: "PollFormId" });
Vote.belongsTo(PollForm, { foreignKey: "PollFormId" });

pollElements.hasMany(Vote, { foreignKey: "element_Id" });
Vote.belongsTo(pollElements, { foreignKey: "element_Id" });
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
const PollForm = require("./PollForm")
>>>>>>> main

=======
const PollForm = require("./PollForm")
>>>>>>> Stashed changes
const Vote = require("./vote")

User.hasMany(PollForm, PollForm, {foreignKey: 'poll_id'});
PollForm.belongsTo(User);

PollForm.hasMany(PollElement, {foreignKey:  'element_id'});
pollElements.belongsTo(PollForm);



module.exports = {
  db,
  User,
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  PollForm,
  pollElements,
Vote,
=======
>>>>>>> main

=======
  PollForm,
  pollElements,
>>>>>>> Stashed changes
  Vote,
>>>>>>> jocsan
};
