const db = require("./db");
const pollElements = require("./pollelements");
const User = require("./user");
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
=======
>>>>>>> main

=======
  PollForm,
  pollElements,
>>>>>>> Stashed changes
  Vote,
>>>>>>> jocsan
};

