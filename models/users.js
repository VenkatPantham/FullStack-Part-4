var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMangoose = require("passport-local-mongoose");

var userSchema = new Schema({
  admin: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(passportLocalMangoose);

var Users = mongoose.model("User", userSchema);

module.exports = Users;
