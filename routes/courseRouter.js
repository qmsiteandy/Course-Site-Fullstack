const express = require("express");
const passport = require("passport");
const router = express.Router();
const mysql = require("../config/mysqlConnection");

router
  .route("/")
  // 選取全部課程
  .get((req, res, next) => {
    mysql.query("SELECT * FROM course", (err, result) => {
      if (err) next(err);
      else return res.status(200).send(result);
    });
  })
  // 發布新課程
  .post(passport.authenticate("jwt", { session: false }), (req, res, next) => {
    // 確認權限是否為 admin 或 teacher
    if (req.user.permission < 1) return res.status(403).send("權限不足");

    const { name, desc, price } = req.body;

    // DB 操作
    mysql.query(
      "INSERT INTO course (course_teacherId, course_name, course_desc, course_price) VALUE(?,?,?,?)",
      [req.user.userId, name, desc, price],
      (err, result) => {
        if (err) next(err);
        else return res.status(201).send("新增課程成功");
      }
    );
  });

// // 從關鍵字尋找
// router.get("/search", (req, res, next) => {
//   const { q } = req.query;

//   if (q) {
//     mysql.query(
//       "SELECT * FROM course WHERE course_name LIKE %測試%",
//       (err, result) => {
//         if (err) next(err);
//         else return res.status(200).send(result);
//       }
//     );
//   } else {
//     return res.status(400).send("請輸入搜尋參數");
//   }
// });

// 選取單筆課程
router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query("SELECT * FROM course WHERE courseID=?", [id], (err, result) => {
    if (err) next(err);
    else return res.status(200).send(result);
  });
});

// 選取老師的所有課程
router.get("/teacher/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query(
    "SELECT * FROM course WHERE course_teacherId=?",
    [id],
    (err, result) => {
      if (err) next(err);
      else return res.status(200).send(result);
    }
  );
});

module.exports = router;
