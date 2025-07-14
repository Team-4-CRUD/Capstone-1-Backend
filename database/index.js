const db = require("./db");
const User = require("./user");
<<<<<<< Updated upstream

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
<<<<<<< Updated upstream

=======
  PollForm,
  pollElements,
>>>>>>> Stashed changes
  Vote,
};
