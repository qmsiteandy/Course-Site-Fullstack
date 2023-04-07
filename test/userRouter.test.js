const axios = require("axios");
require("dotenv").config();

// 結束測試後刪除測試資料
afterAll(async () => {
  await axios.delete(`${process.env.SERVER_URL}/api/user/test`).then((res) => {
    console.log("刪除 user 測試資料成功");
  });
});

// 測試註冊功能
describe("[userRouter 註冊功能]", () => {
  test("測試缺少資料狀況", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(400);
      });
  });
  test("測試成功新增使用者", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
        password: "test",
      })
      .then((res) => {
        expect(res.status).toEqual(201);
      })
      .catch((err) => {});
  });
  test("測試帳號已存在狀況", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
        password: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(400);
      });
  });
  console.log("[userRouter 註冊功能] 測試完成");
});

// 測試登入功能
describe("[userRouter 登入功能]", () => {
  test("測試輸入無效帳號", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "undefined",
        password: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(404);
      });
  });
  test("測試輸入密碼錯誤", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "test",
        password: "tttt",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(404);
      });
  });
  test("測試登入成功", async () => {
    await axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "test",
        password: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(200);
      });
  });
  console.log("[userRouter 登入功能] 測試完成");
});
