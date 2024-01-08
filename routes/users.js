const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/pintrest-2");

const userSchema = mongoose.Schema({
  username: String,
  birthday: {
    date: {
      type: Number,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
  },
  ProfileImage: String,
  phone: String,
  password: String,
  posts:[
     {
      type: mongoose.Schema.Types.ObjectId,
      ref:"post"
    }
  ]
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
