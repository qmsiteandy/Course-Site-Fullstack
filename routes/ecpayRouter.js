const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const passport = require("../config/passport");
const ecpay_payment = require("../node_modules/ecpay_aio_nodejs/lib/ecpay_payment");
const options = require("../node_modules/ecpay_aio_nodejs/conf/config-example"); // 官方提供測試用的店家資訊
const mysql = require("../config/mysqlConnection");
const { Cart, Mycourse } = require("../models");

router.post(
  "/submitOrder",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { order_courseId_list } = req.body;
    console.log(order_courseId_list.toString());
    let total = 0; // 訂單總價
    let itemName = ""; // 用於交易資訊

    // 依序訂單的課程編號，撈取對應課程，並計算付款資訊
    mysql.query(
      "SELECT name, price FROM course WHERE id IN (?)",
      [order_courseId_list],
      (err, result) => {
        if (err) next(err);
        // 將課程名稱換作陣列、加總價格
        for (let i = 0; i < result.length; i++) {
          itemName += `#${result[i].name}`;
          total += result[i].price;
        }

        // 交易資訊
        let base_param = {
          MerchantTradeNo: uuid_20(), // 每筆交易都需要獨特的交易碼 (必須為20碼)
          MerchantTradeDate: dateString(), // 交易時間(格式為：yyyy/MM/dd HH:mm:ss)
          TotalAmount: total.toString(), // 交易金額，注意需轉換為 String ！！
          TradeDesc: "綠界第三方支付", // 交易說明
          ItemName: itemName, // 顯示商品名稱。如果有多筆，商品名稱以符號#分隔
          ReturnURL:
            "https://0d91-117-56-242-145.jp.ngrok.io/ecpay/pay_success", // 為付款結果通知回傳網址，為特店server或主機的URL
          ClientBackURL: `${process.env.SERVER_URL}/mycourse`, // 前端綠界畫面的"返回商店"按鈕連結
          CustomField1: req.user.id.toString(), // 使用者編號，需轉換為字串
          CustomField2: order_courseId_list.toString(), // 購買課程編號，需轉換為字串
        };
        // 發票資訊
        let inv_params = {};

        // 建立綠界付款頁面
        // option 內容為綠界提供的測試店家資訊
        const create = new ecpay_payment(options);
        const htm = create.payment_client.aio_check_out_credit_onetime(
          base_param,
          inv_params
        );

        res.status(200).send(htm);
      }
    );
  }
);

router.post("/pay_success", async (req, res, next) => {
  // 此處未來可以增設驗證機制
  // 例如使用綠界檢查碼[CheckMacValue]進行確認

  const userId = req.body.CustomField1;
  const order_courseId_list = req.body.CustomField2.split(","); // 轉換為陣列

  // 移除購物車中已付款項目
  try {
    await Cart.findOneAndUpdate(
      { studentId: userId },
      { $pull: { courseId_array: { $in: order_courseId_list } } }
    );
    // 將已付款項目加入我的課程中
    await Mycourse.findOneAndUpdate(
      { studentId: userId },
      {
        $addToSet: { courseId_array: { $each: order_courseId_list } },
      },
      {
        upsert: true, // 如果沒有這筆 document 自動新增
      }
    );
  } catch (err) {
    next(err);
  }

  res.send("1|OK"); // 回傳讓綠界 Server 知道這筆訂單完成
});

// 將當前日期組成 YYYY/MM/DD HH:MM:SS 格式
function dateString() {
  let date = new Date();
  return (dateStr =
    date.getFullYear() +
    "/" +
    ("00" + (date.getMonth() + 1)).slice(-2) +
    "/" +
    ("00" + date.getDate()).slice(-2) +
    " " +
    ("00" + date.getHours()).slice(-2) +
    ":" +
    ("00" + date.getMinutes()).slice(-2) +
    ":" +
    ("00" + date.getSeconds()).slice(-2));
}

function uuid_20() {
  let uuid_chunk = uuidv4().split("-"); // uuidv4 的結果為 32 碼，可用 "-" 切割成 8+4+4+4+12 碼
  return uuid_chunk[0] + uuid_chunk[1] + uuid_chunk[2] + uuid_chunk[3];
}

module.exports = router;
