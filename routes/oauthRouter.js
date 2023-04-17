const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"], //希望獲得的資料範圍，profile代表個人資訊
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // 建立 JWT
    const tokenObj = {
      id: req.user.id,
      name: req.user.name,
      permission: req.user.permission,
    };
    const token = jwt.sign(tokenObj, process.env.JWT_SECRET, {
      expiresIn: "12 h",
    });

    return res.redirect(
      `/oauth-login-success?user=${JSON.stringify(req.user)}&token=${
        "JWT " + token
      }`
    );
  }
);

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
  }),
  function (req, res) {
    // 建立 JWT
    const tokenObj = {
      id: req.user.id,
      name: req.user.name,
      permission: req.user.permission,
    };
    const token = jwt.sign(tokenObj, process.env.JWT_SECRET, {
      expiresIn: "12 h",
    });

    return res.redirect(
      `/oauth-login-success?user=${JSON.stringify(req.user)}&token=${
        "JWT" + token
      }`
    );
  }
);

module.exports = router;
