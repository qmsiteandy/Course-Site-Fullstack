const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

/* 可直接進入的頁面 */

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

router.get("/oauth-login-success", (req, res) => {
  res.render("oauth-login-success.ejs");
});

/* 需要使用 JWT 驗證才可進入的頁面 */

const token_fail_msg = "登入權證失效，請重新登入"; // JWT token 失效訊息

router.get(
  "/mycourse",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: `/login?msg=${token_fail_msg}`,
  }),
  (req, res) => {
    res.render("mycourse.ejs");
  }
);

router.get(
  "/backend",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: `/login?msg=${token_fail_msg}`,
  }),
  (req, res) => {
    res.render("backend.ejs");
  }
);

router.get(
  "/teacher_register",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: `/login?msg=${token_fail_msg}`,
  }),
  (req, res) => {
    res.render("teacherRegister.ejs");
  }
);

router.get(
  "/shopcart",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: `/login?msg=${token_fail_msg}`,
  }),
  (req, res) => {
    res.render("shopcart.ejs");
  }
);

module.exports = router;
