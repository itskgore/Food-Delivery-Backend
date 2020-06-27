const AppError = require("./../utils/AppError");
const handleCastErrorDB = (err) => {
  const message = `Invalid error ${err.path} is ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `The Tour name ${value} already exist. Please enter new name`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorForDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  //TEMPLATE RENDER WEBSITE
  return res.status(404).json({
    title: "Something went wrong",
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      //Operation Error trusted error we can send msg to client
      return res.status(err.statusCode).json({
        status: err.status,
        msg: err.message,
      });
    }
    //Third Party lib or unknown error don't want to send msg to client

    // 1) Logging the error
    console.error(err);

    // 2) Send a generic msg
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
  //TEMPLATE RENDER WEBSITE
  if (err.isOperational) {
    //Operation Error trusted error we can send msg to client
    // console.log(err);
    return res.status(err.statusCode).json({
      status: err.status,
      msg: err.message,
    });
  }
  //Third Party lib or unknown error don't want to send msg to client

  // 1) Logging the error
  console.error(err);

  // 2) Send a generic msg
  return res.status(404).json({
    title: "Something went wrong",
    msg: "Please try again later!",
  });
};

const handleJWTTokenError = () =>
  new AppError("Token is Invalid Please Login Again", 401);

const handleJWTTokenExpiredError = () =>
  new AppError("Your Token Expired, Please login again", 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // err.statusCode will be created from the calling middleware or handlers
  err.status = err.status || "failed"; // err.status will be created from the calling middleware or handlers
  // console.log(err.stack); // current handler or controller hitting an error
  if (process.env.NODE_ENV == "development") {
    sendErrorForDev(err, req, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = { ...err };
    error.message = err.message; //  above code was not adding message in the error
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTTokenError();
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTTokenExpiredError();
    }
    sendErrorProd(error, req, res);
  }
};
