const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    validate: [
      validator.isAlphanumeric,
      "Your name should only contain alphabets",
    ],
  },
  email: {
    type: String,
    unique: [true, "Email-id Already exists"],
    lowercase: true, //Transform the email to lowercase
    validate: [validator.isEmail, "Please enter a valid email-id"],
  },
  mobileNo: {
    type: String,
    unique: [true, "Mobile no. Already exists"],
    validate: [validator.isMobilePhone, "Please enter a valid mobile number"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should have at least 8 characters"],
    select: false, //By this it will not be displayed the password in response this.password cannot be used
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //This only works on save and create!!
      validator: function(el) {
        //using simple function to get access to this keyword
        return el === this.password;
      },
      message: "Password and Confirm-Password did not match",
    },
  },
  isGoogle: {
    type: Boolean,
    default: false,
  },
  isFacebook: {
    type: Boolean,
    default: false,
  },
  passwordChangedTimeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function(next) {
  //using simple function to get access to this keyword
  //only run this function if this password was modified
  if (!this.isModified("password")) {
    return next();
  }
  //hashing password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //deleting confirm password to avoid redundant data
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function(
  // this can be accessed by a User instance only not by User itself
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
