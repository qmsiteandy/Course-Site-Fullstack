const express = require("express");
const passport = require("passport");
const router = express.Router();
const mysql = require("../config/mysqlConnection");
const bcrypt = require("bcrypt");

router.post(
  "/teacherRegister",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // 確認權限是否為 admin
    if (req.user.permission < 2) return res.status(403).send("權限不足");

    // 取得傳入資料並檢查有無缺漏
    const { name, account, password } = req.body;
    if (!name || !account || !password) {
      return res.status(400).send("缺少部分參數資料");
    }

    // 檢查 DB 是否已存在此帳號
    mysql.query(
      "SELECT * FROM user WHERE account=?",
      [account],
      (err, result) => {
        if (err) {
          next(err);
        }
        if (result.length != 0) {
          return res.status(400).send("此教師帳號已存在");
        } else {
          // 進行密碼加密
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) next(err);

              // 將輸入資料以及加密後的密碼存入 DB
              mysql.query(
                "INSERT INTO user (name, account, password, permission) VALUES(?, ?, ?, ?)",
                [name, account, hash, 1],
                (err, result) => {
                  if (err) {
                    next(err);
                  } else {
                    return res.status(201).send("教師註冊成功！");
                  }
                }
              );
            });
          });
        }
      }
    );
  }
);

module.exports = router;
