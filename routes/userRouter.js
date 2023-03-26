const express = require("express");
const router = express.Router();
const mysql = require("../config/mysqlConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {
  // 取得傳入資料並檢查有無缺漏
  const { name, account, password } = req.body;
  if (!name || !account || !password) {
    return res.status(400).send({ error: "缺少部分參數資料" });
  }

  // 檢查 DB 是否已存在此帳號
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

router.post("/login", (req, res, next) => {
  // 取得傳入資料並檢查有無缺漏
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).send({ error: "缺少部分參數資料" });
  }

  // 在 DB 中找到對應的 account 資料
  mysql.query(
    "SELECT * FROM user WHERE user_account=?",
    [account],
    (err, result) => {
      if (result == null && result[0] == null) {
        return res.status(404).send({ error: "帳號或密碼錯誤" });
      } else {
        // 取得 DB 中該帳號的 JSON 資料
        const userData = JSON.parse(JSON.stringify(result[0]));

        // 比對密碼
        bcrypt
          .compare(password, userData.user_password)
          .then((isMatch) => {
            if (isMatch == false) {
              return res.status(404).send({ error: "帳號或密碼錯誤" });
            }
            // 登入成功
            else {
              // 建立 JWT
              const tokenObj = {
                userId: userData.userId,
                name: userData.user_name,
                permission: userData.user_permission,
              };
              const token = jwt.sign(tokenObj, process.env.JWT_SECRET, {
                expiresIn: "1 day",
              });

              return res.status(200).send({
                msg: "登入成功",
                user: {
                  name: userData.user_name,
                  permission: userData.user_permission,
                },
                token: "JWT " + token,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(400).send({ error: err });
          });
      }
    }
  );
});

module.exports = router;
