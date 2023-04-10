const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const Cart = require("../models/cartModel");
const mysql = require("../config/mysqlConnection");

// 取得購物車所有課程資訊
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    // 從 MongoDB 中找尋對應使用者的購物車項目
    let { courseId_array } = await Cart.findOne({
      studentId: req.user.id,
    });

    // 取出對應課程資料
    mysql.query(
      "SELECT course.id, course.name as name, course.description, course.price, user.name as teacherName \
      FROM course LEFT JOIN user ON course.teacherId = user.id  \
      WHERE course.id IN (?)",
      [courseId_array],
      (err, result) => {
        if (err) {
          next(err);
        }
        return res.status(200).send(result);
      }
    );
  }
);

// 新增購物車內容
router.post(
  "/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { courseId } = req.params;

    // 只有學生可以將課程加入購物車
    if (req.user.permission != 0) {
      return res.status(403).send("限學生帳號可進行此操作");
    }

    // 將 courseId 推入 courseId_array 中
    // 使用 $addToSet 自動判斷新內容是否已存在 array 中，若無才新增
    const result = await Cart.findOneAndUpdate(
      { studentId: req.user.id },
      {
        $addToSet: { courseId_array: courseId },
      },
      {
        upsert: true, // 如果沒有這筆 document 自動新增
        new: true, // 回傳更新後的內容
      }
    );
    return res.status(200).send("購物車新增成功");

    // // 從資料庫找出 cart 資料
    // let cart = await Cart.findOne({ studentId: req.user.id });
    // // 如果還沒有這個 cart 資料，新建立一筆
    // if (!cart) {
    //   new Cart({ studentId: req.user.id, courseId_array: [courseId] })
    //     .save()
    //     .then((data) => {
    //       return res.status(200).send("新增購物車成功");
    //     })
    //     .catch((err) => {
    //       next(err);
    //     });
    // }
    // // 修改現存 cart 資料
    // else {
    //   // 確認是否已存在於 courseId_array 中
    //   const found = cart.courseId_array.find((element) => element == courseId);
    //   if (found) {
    //     return res.status(400).send("此課程已存在購物車中");
    //   } else {
    //     // 插入 courseId_array 中
    //     cart.courseId_array.push(courseId);
    //     // 儲存更新後資料
    //     await cart.save();
    //     return res.status(200).send("新增購物車成功");
    //   }
    // }
  }
);

// 刪除購物車內容
router.delete(
  "/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { courseId } = req.params;

    // 只有學生可以將課程加入購物車
    if (req.user.permission != 0) {
      return res.status(403).send("限學生帳號可進行此操作");
    }

    // 使用 $pull 刪除 array 中的項目
    const result = await Cart.findOneAndUpdate(
      { studentId: req.user.id },
      {
        $pull: { courseId_array: courseId },
      },
      {
        new: true, // 回傳更新後的內容
      }
    );
    return res.status(200).send("購物車刪除成功");
  }
);

module.exports = router;
