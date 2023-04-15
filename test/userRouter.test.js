const axios = require("axios");
require("dotenv").config();

// 結束測試後刪除測試資料
afterAll((done) => {
  axios.delete(`${process.env.SERVER_URL}/api/user/test`).then((res) => {
    // console.log("刪除 user 測試資料成功");
    done();
  });
});

// 測試註冊功能
describe("[userRouter 註冊功能]", () => {
  test("測試缺少資料狀況", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(400);
        done();
      });
  });
  test("測試成功新增使用者", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
        password: "test",
      })
      .then((res) => {
        expect(res.status).toEqual(201);
        done();
      });
  });
  test("測試帳號已存在狀況", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user`, {
        name: "test",
        account: "test",
        password: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(400);
        done();
      });
  });
});

// 測試登入功能
describe("[userRouter 登入功能]", () => {
  test("測試輸入無效帳號", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "undefined",
        password: "test",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(404);
        done();
      });
  });
  test("測試輸入密碼錯誤", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "test",
        password: "tttt",
      })
      .catch((err) => {
        expect(err.response.status).toEqual(404);
        done();
      });
  });
  test("測試登入成功", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/user/login`, {
        account: "test",
        password: "test",
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        done();
      });
  });
});
