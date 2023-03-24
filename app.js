const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { pageRouter, userRouter } = require("./routes");

// Set view engine to ejs
app.set("view engine", "ejs");

// Set public folder as static
app.use(express.static(__dirname + "/public"));

// Initial body-parser to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/", pageRouter);
app.use("/api/user", userRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err);
});

// Run server
app.listen(3000, () => {
  console.log(`App is running on port 3000`);
});
