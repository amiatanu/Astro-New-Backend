const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  walletId: String,
});

const UserLogin = mongoose.model("User", userSchema);

module.exports = UserLogin;
