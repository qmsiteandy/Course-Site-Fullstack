const axios = require("axios");
require("dotenv").config();

describe("[cartRouter 加入項目功能]", () => {
  test("測試購物車加入成功", (done) => {
    axios
      .post(`${process.env.SERVER_URL}/api/cart/1`, null, {
        headers: { Cookie: `token=${process.env.TEST_STUDENT_TOKEN}` },
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        done();
      });
  });
});

describe("[cartRouter 刪除項目功能]", () => {
  test("測試購物車刪除成功", (done) => {
    axios
      .delete(`${process.env.SERVER_URL}/api/cart/1`, {
        headers: { Cookie: `token=${process.env.TEST_STUDENT_TOKEN}` },
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        done();
      });
  });
});
