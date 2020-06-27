const express = require("express");
const app = express();
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const globalErrorHandler = require("./controller/errorcontroller");

console.log("HELLO");

// Development Logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

//  Body parser reading data from the body to req.body
app.use(express.json({ limit: "10kb" })); // only  kb data will be accepted
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  console.log(req.requestTime);
  // console.log(req.cookies);
  next();
});

// ROUTES
app.use("/api/v1/users", authRoutes);
app.use(globalErrorHandler);

module.exports = app;
