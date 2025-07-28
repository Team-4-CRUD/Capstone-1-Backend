const db = require("./db");
const pollElements = require("./pollelements");
const User = require("./user");
const PollForm = require("./PollForm");
const Vote = require("./vote");
const VoteRank = require("./VoteRank");
const DraftVote = require("./DraftVotes");

//Associations 🎂

//Create Form
User.hasMany(PollForm, { foreignKey: "creator_id" });
PollForm.belongsTo(User, { foreignKey: "creator_id" });

// to access the pollElements from a PollForm vice versa, the "as" is just a nickname given to the relationship
PollForm.hasMany(pollElements, {
  foreignKey: "PollFormId",
  as: "pollElements",
});
pollElements.belongsTo(PollForm, { foreignKey: "PollFormId", as: "PollForm" });

// For voting
Vote.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Vote, { foreignKey: "user_id" });

PollForm.hasMany(Vote, { foreignKey: "pollForm_id" });
Vote.belongsTo(PollForm, { foreignKey: "pollForm_id" });

Vote.hasMany(VoteRank, { foreignKey: "vote_id" });
VoteRank.belongsTo(Vote, { foreignKey: "vote_id" });

//Each voteRank points to a specific PollElement
pollElements.hasMany(VoteRank, { foreignKey: "element_id", as: "voteRanks" });
VoteRank.belongsTo(pollElements, {
  foreignKey: "element_id",
  as: "pollElement",
});

//DraftVote is not directly related to Vote because a draft isn’t a vote yet; it’s a separate entity.
DraftVote.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(DraftVote, { foreignKey: "user_id" });

DraftVote.belongsTo(PollForm, {
  foreignKey: "pollForm_id",
  onDelete: "CASCADE",
});
PollForm.hasMany(DraftVote, { foreignKey: "pollForm_id" });

module.exports = {
  db,
  User,
  PollForm,
  pollElements,
  Vote,
  VoteRank,
  DraftVote,
};
