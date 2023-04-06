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

// 選取老師的所有課程
router.get("/teacher/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query("SELECT * FROM course WHERE teacherId=?", [id], (err, result) => {
    if (err) next(err);
    else return res.status(200).send(result);
  });
});

// 選取單筆課程
router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query("SELECT * FROM course WHERE id=?", [id], (err, result) => {
    if (err) next(err);
    else return res.status(200).send(result);
  });
});

// // 從關鍵字尋找
// router.get("/search", (req, res, next) => {
//   const { q } = req.query;

//   if (q) {
//     mysql.query(
//       "SELECT * FROM course WHERE name LIKE %測試%",
//       (err, result) => {
//         if (err) next(err);
//         else return res.status(200).send(result);
//       }
//     );
//   } else {
//     return res.status(400).send("請輸入搜尋參數");
//   }
// });

// 發布新課程
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // 確認權限是否為 admin 或 teacher
    if (req.user.permission < 1) return res.status(403).send("權限不足");

    const { name, description, price } = req.body;

    // DB 操作
    mysql.query(
      "INSERT INTO course (teacherId, name, description, price) VALUE(?,?,?,?)",
      [req.user.id, name, description, price],
      (err, result) => {
        if (err) next(err);
        else return res.status(201).send("新增課程成功");
      }
    );
  }
);

// 修改課程
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // 確認權限是否為 admin 或 對應的 teacher
    if (
      req.user.permission < 1 ||
      (req.user.permission == 1 && req.body.teacherId != req.user.id)
    ) {
      return res.status(403).send("無權修改此課程");
    }

    // 確認輸入資料完整
    const { name, description, price } = req.body;
    if (!name && !description && !price)
      return res.status(400).send("缺少資料");

    // DB 操作
    mysql.query(
      "UPDATE course SET name=?, description=?, price=? WHERE id=?",
      [name, description, price, req.params.id],
      (err, result) => {
        if (err) next(err);
        return res.status(200).send("修改成功");
      }
    );
  }
);

// 刪除課程
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    console.log(req.body, req.user);
    // 確認權限是否為 admin 或 對應的 teacher
    if (
      req.user.permission == 0 ||
      (req.user.permission == 1 && req.body.teacherId != req.user.id)
    ) {
      return res.status(403).send("無權修改此課程");
    }

    mysql.query(
      "DELETE FROM course WHERE id=?",
      [req.params.id],
      (err, result) => {
        if (err) next(err);
        return res.status(200).send("刪除成功");
      }
    );
  }
);

module.exports = router;
