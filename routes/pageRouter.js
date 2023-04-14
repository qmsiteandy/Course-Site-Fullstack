const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.get("/course/:id", (req, res) => {
  res.render("coursePage.ejs");
});

router.get(
  "/mycourse",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/login?msg=登入token認證過期，請重新登入！",
  }),
  (req, res) => {
    res.render("mycourse.ejs");
  }
);

router.get(
  "/backend",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/login?msg=登入token認證過期，請重新登入！",
  }),
  (req, res) => {
    res.render("backend.ejs");
  }
);

router.get(
  "/teacher_register",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/login?msg=登入token認證過期，請重新登入！",
  }),
  (req, res) => {
    res.render("teacherRegister.ejs");
  }
);

router.get(
  "/shopcart",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/login?msg=登入token認證過期，請重新登入！",
  }),
  (req, res) => {
    res.render("shopcart.ejs");
  }
);

module.exports = router;
