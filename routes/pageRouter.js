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

router.get("/mycourse", (req, res) => {
  res.render("mycourse.ejs");
});

router.get("/backend", (req, res) => {
  res.render("backend.ejs");
});

router.get(
  "/shopcart",
  passport.authenticate("jwt", { failureRedirect: "/login" }),
  (req, res) => {
    console.log(req.user);
    res.render("shopcart.ejs");
  }
);

module.exports = router;
