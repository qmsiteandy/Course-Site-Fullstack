const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const session = require("express-session");
const passport = require("./config/passport");

// Set view engine to ejs
app.set("view engine", "ejs");

// Set public folder as static
app.use(express.static(__dirname + "/public"));

// Initial cookie-parser to parse request cookie
app.use(cookieParser());
// Initial body-parser to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/", routes.pageRouter);
app.use("/api/user", routes.userRouter);
app.use("/api/admin", routes.adminRouter);
app.use("/api/course", routes.courseRouter);
app.use("/oauth", routes.oauthRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ error: "Something is wrong. Error: " + err });
});

// Run server
app.listen(3000, () => {
  console.log(`App is running on port 3000`);
});
