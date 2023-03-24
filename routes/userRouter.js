const express = require("express");
const router = express.Router();
const mysql = require("../config/mysqlConnection");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res, next) => {
  // // 取得傳入資料並檢查有無缺漏
  const { name, account, password } = req.body;
  if (!name || !account || !password) {
    return res.status(400).send({ error: "缺少部分參數資料" });
  }

  // // 檢查 DB 是否已存在此帳號
  mysql.query(
    "SELECT * FROM user WHERE user_account=?",
    [account],
    (err, result) => {
      if (err) {
        return res.status(400).send({ error: err });
      }
      if (result.length != 0) {
        return res.status(400).send({ error: "此帳號已存在" });
      } else {
        // 進行密碼加密
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) return res.status(400).send({ error: err });

            // 將輸入資料以及加密後的密碼存入 DB
            mysql.query(
              "INSERT INTO user (user_name, user_account, user_password) VALUES(?, ?, ?)",
              [name, account, hash],
              (err, result) => {
                if (err) {
                  return res.status(400).send({ error: err });
                } else {
                  return res.status(201).send({ msg: "註冊成功！" });
                }
              }
            );
          });
        });
      }
    }
  );
});

module.exports = router;
