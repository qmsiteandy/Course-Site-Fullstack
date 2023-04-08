const axios = require("axios");
require("dotenv").config();

// 結束測試後刪除測試資料
afterAll(async () => {
  await axios
    .delete(`${process.env.SERVER_URL}/api/course/test`)
    .then((res) => {
      console.log("刪除 course 測試資料成功");
    });
});

// 測試註冊功能
describe("[courseRouter 發布課程]", () => {
  test("測試發布課程成功", async () => {
    await axios
      .post(
        `${process.env.SERVER_URL}/api/course`,
        {
          name: "test",
          description: "test",
          price: 0,
        },
        { headers: { Authorization: process.env.TEST_ADMIN_TOKEN } }
      )
      .then((res) => {
        expect(res.status).toEqual(201);
      });
  });
  console.log("[courseRouter 發布課程] 測試完成");
});

// 測試修改課程功能
describe("[courseRouter 修改課程]", () => {
  test("測試發布課程成功", async () => {
    await axios
      .post(
        `${process.env.SERVER_URL}/api/course`,
        {
          name: "test",
          description: "test",
          price: 0,
        },
        { headers: { Authorization: process.env.TEST_ADMIN_TOKEN } }
      )
      .then((res) => {
        expect(res.status).toEqual(201);
      });
  });
  console.log("[courseRouter 發布課程] 測試完成");
});
