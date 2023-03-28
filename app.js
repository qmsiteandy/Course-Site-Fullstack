const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { pageRouter, userRouter } = require("./routes");
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

// // Initial session
// app.use(
//   session({
//     secret: process.env.SESSION_KEY,
//     saveUninitialized: true,
//     resave: false,
//   })
// );

// // Initial passport and passport-session
// app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use("/", pageRouter);
app.use("/api/user", userRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ error: "Something is wrong \n " + err });
});

// Run server
app.listen(3000, () => {
  console.log(`App is running on port 3000`);
});
