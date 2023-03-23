const express = require("express");
const router = express.Router();

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

router.get("/admin", (req, res) => {
  res.render("admin.ejs");
});

router.get("/shopcart", (req, res) => {
  res.render("shopcart.ejs");
});

module.exports = router;
