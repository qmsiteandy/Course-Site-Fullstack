const axios = require("axios");
require("dotenv").config();

let test_course_id = "";

// 結束測試後刪除所有尚存的測試資料
afterAll(async () => {
  await axios
    .delete(`${process.env.SERVER_URL}/api/course/test`)
    .then((res) => {
      console.log("刪除 course 測試資料成功");
    });
});

// 測試發布新課程功能
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
        test_course_id = res.data.result.insertId;
        expect(res.status).toEqual(201);
      });
  });
});

// 測試修改課程功能
describe("[courseRouter 修改課程]", () => {
  test("測試修改課程成功", async () => {
    await axios
      .put(
        `${process.env.SERVER_URL}/api/course/${test_course_id}`,
        {
          name: "test",
          description: "123456789",
          price: 0,
        },
        { headers: { Authorization: process.env.TEST_ADMIN_TOKEN } }
      )
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });
});

// 測試刪除課程功能
describe("[courseRouter 刪除課程]", () => {
  test("測試刪除課程成功", async () => {
    await axios
      .delete(`${process.env.SERVER_URL}/api/course/${test_course_id}`, {
        headers: { Authorization: process.env.TEST_ADMIN_TOKEN },
      })
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });
});
