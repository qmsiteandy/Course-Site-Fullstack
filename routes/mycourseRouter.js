const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const { Mycourse } = require("../models");
const mysql = require("../config/mysqlConnection");

// 取得購物車所有課程資訊
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    // 從 MongoDB 中找尋對應使用者的購物車項目
    let findMycourse = null;
    try {
      findMycourse = await Mycourse.findOne({
        studentId: req.user.id,
      });
    } catch (err) {
      next(err);
    }

    // 資料庫中有對應的購物車資料
    if (findMycourse && findMycourse.courseId_array.length > 0) {
      // 取出對應課程資料
      mysql.query(
        "SELECT course.id, course.name as name, course.description, course.price, user.name as teacherName \
          FROM course LEFT JOIN user ON course.teacherId = user.id  \
          WHERE course.id IN (?)",
        [findMycourse.courseId_array],
        (err, result) => {
          if (err) {
            next(err);
          }
          return res.status(200).send(result);
        }
      );
    }
    // 如果資料庫中沒有對應資料，回傳空陣列
    else {
      return res.status(200).send([]);
    }
  }
);

module.exports = router;
