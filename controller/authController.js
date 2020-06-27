const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../Models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const validator = require("validator");
const createAndSendToken = (user, statusCode, res, req) => {
  const token = signToken(user._id);

  //Removes the password
  user.password = undefined;
  user.isGoogle = undefined;
  user.isFacebook = undefined;
  user.active = undefined;
  res.status(statusCode).json({
    status: "success",
    token: token,
    user,
  });
};

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { name, email, password, confirm_password } = req.body;
  const newUser = await User.create(req.body);
  createAndSendToken(newUser, 201, res, req);
  next();
});
exports.login = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { username, password } = req.body;

  // 1) if email and password exist
  if (!username || !password) {
    return next(new AppError("Please provide username and password", 400));
  }
  let user;

  // 2) check if user exist && the password is correct
  if (validator.isEmail(username)) {
    user = await User.findOne({ email: username }).select("+password"); // select is mention becoz password is false in model
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect Email or Password", 401));
    }
  } else {
    user = await User.findOne({ mobileNo: username }).select("+password"); // select is mention becoz password is false in model
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect Email or Password", 401));
    }
  }
  // 3) if everything is ok, send the token to client
  createAndSendToken(user, 200, res, req);
});
