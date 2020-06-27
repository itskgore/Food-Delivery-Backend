const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  // console.log(err.name, err.message);
  // console.log('Uncaught Exception.... Shutting down...');
  process.exit(1); //0 =success 1= un caught exception
});

const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection done!");
  });

const app = require("./index");
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`running on port ${port}....`);
});
