const express = require("express");
const router = express.Router();
const mysql = require("../config/mysqlConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// 用戶註冊
router.post("/", async (req, res, next) => {
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
        return res.status(400).send("此帳號已存在");
      } else {
        // 進行密碼加密
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) next(err);

            // 將輸入資料以及加密後的密碼存入 DB
            mysql.query(
              "INSERT INTO user (name, account, password) VALUES(?, ?, ?)",
              [name, account, hash],
              (err, result) => {
                if (err) {
                  next(err);
                } else {
                  return res.status(201).json({
                    msg: "註冊成功！",
                    result: { insertId: result.insertId },
                  });
                }
              }
            );
          });
        });
      }
    }
  );
});

// 刪除 test 帳戶
router.delete("/test", (req, res, next) => {
  mysql.query("DELETE FROM user WHERE name LIKE '%test%'", (err, result) => {
    if (err) next(err);
    return res.status(200).send("刪除成功");
  });
});

// 刪除帳戶
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { id } = req.params;

    console.log(account);
    //檢查權限是否 Admin 或是否為自己的帳戶
    if (
      (req.user.permission == 0 || req.user.permission == 1) &&
      req.user.account != account
    ) {
      return res.status(403).send("權限不足");
    }

    // 操作 DB
    mysql.query(
      "DELETE FROM user WHERE account=?",
      [account],
      (err, result) => {
        if (err) next(err);
        res.status(200).send("刪除成功");
      }
    );
  }
);

// 用戶登入
router.post("/login", (req, res, next) => {
  // 取得傳入資料並檢查有無缺漏
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).send({ error: "缺少部分參數資料" });
  }

  // 在 DB 中找到對應的 account 資料
  mysql.query(
    "SELECT * FROM user WHERE account=?",
    [account],
    (err, result) => {
      if (result == null || result[0] == undefined) {
        return res.status(404).send("帳號或密碼錯誤，請重新輸入！");
      } else {
        // 取得 DB 中該帳號的 JSON 資料
        const userData = JSON.parse(JSON.stringify(result[0]));
        // 比對密碼
        bcrypt
          .compare(password, userData.password)
          .then((isMatch) => {
            if (isMatch == false) {
              return res.status(404).send("帳號或密碼錯誤");
            }
            // 登入成功
            else {
              // 建立 JWT
              const tokenObj = {
                id: userData.id,
                name: userData.name,
                permission: userData.permission,
              };
              const token = jwt.sign(tokenObj, process.env.JWT_SECRET, {
                expiresIn: "12 h",
              });

              return res.status(200).send({
                msg: "登入成功",
                user: {
                  id: userData.id,
                  name: userData.name,
                  permission: userData.permission,
                },
                token: "JWT " + token,
              });
            }
          })
          .catch((err) => {
            next(err);
          });
      }
    }
  );
});

module.exports = router;
