const express = require("express");
const passport = require("passport");
const router = express.Router();
const mysql = require("../config/mysqlConnection");

// 選取全部課程
router.get("/", (req, res, next) => {
  mysql.query("SELECT * FROM course", (err, result) => {
    if (err) next(err);
    else return res.status(200).send(result);
  });
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
