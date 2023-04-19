# Course-Site 電商網站 
## 專案概述
以此專案學習網路電商的後端設計，並搭配前端介面進行操作，主要技術包含：
1. 電商 API 設計
1. 資料庫設計及操作 (結合 MySQL + MongoDB)
1. 後端渲染模板操作 (EJS)
1. 使用者的註冊、登入、帳號管理流程
1. 使用者權限控管
1. 路由的 Middleware 設計
1. JWT 身分驗證機制
1. 購物車使用流程
1. OAuth 登入機制
1. 綠界金流付款機制
1. Unit Test 針對 API 測試

## 專案展示
https://youtu.be/ABr1SblAq7g

## Swagger API 文件
https://app.swaggerhub.com/apis/qmsiteandy/Course-Site/1.0.0

## 使用工具
項目       |工具
----------|----------------
後端開發   | Node.js、Express 架構
前端介面   | EJS 渲染模板、Bootstrap
資料庫     | MySQL、MongoDB
身分驗證套件  | Passport
OAuth     | Passport
第三方金流  | 綠界科技

## 資料庫架構
![資料庫架構](https://i.imgur.com/HCSb5KC.png)

<!-- -------- -->

# 功能介紹 & 運作邏輯
## 目錄
[使用者註冊/登入/登出](#一使用者註冊登入登出)   
[OAuth 登入](#二oauth-登入)  
[JWT token 使用 & 權限控制](#三jwt-token-使用--權限控制)  
[課程管理後台](#四課程管理後台)  
[購物車操作](#五購物車操作)  
[綠界付款](#六綠界付款)  


## 一、使用者註冊/登入/登出
>[User API 的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/userRouter.js)

### 1-1註冊：
當前端 From 註冊表單送出時呼叫後端 \<POST\> /api/user，API 運作邏輯：
1. 檢查傳入資訊是否缺漏 (必須包含 name、account、password 三樣)
2. 檢查此帳號是否已存在於 MySQL 資料庫中
3. 使用 bcrypt 套件進行密碼加密
4. 將輸入資料以及加密後的密碼存入 MySQL
5. 回傳狀態碼 201 註冊成功，或是 400 註冊失敗
   
### 1-2登入：
本專案的登入狀態以 storage 以及 JWT token 來做判斷，沒有用到後端 session 功能，因為 session 會大量耗用 server 的記憶體。

當前端 From 登入表單送出時呼叫後端 \<POST\> /api/user/login，API 運作邏輯：
1. 檢查傳入資訊是否缺漏 (必須包含 account、password)
2. 從 MySQL 找出該 account 資料
3. 使用 bcrypt 套件進行密碼比對
4. 如果找不到帳戶或是密碼錯誤，都統一回傳錯誤訊息 "帳號或密碼錯誤"
   >如果分成"查無帳號"、"密碼錯誤"兩種訊息，有心人士有機會試出哪些帳號是存在的。
5. 登入成功
6. 將使用者資訊 (包含id、名稱、身分權限) 建成 JWT token 
7. 回傳 200 登陸成功，回傳 token 以及 user 資料
   >token：會被存在瀏覽器 cookie，並於每一次的 request 中帶入。  
   >user data：會被存在瀏覽器 localStorage，主要影響頁面的顯示 (例如 NavBar 的按鍵內容)

### 1-3登出：
因為前端是使用 storage 內容來判斷是否為登入狀態，因此登出時只需要將 cookie 及 localStorage 刪除即可。


## 二、OAuth 登入
本專案使用 [passport](https://www.npmjs.com/package/passport) 搭配 [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20) 及 [passport-facebook](https://www.npmjs.com/package/passport-facebook) 兩種登入 Strategy 進行 Oauth 登入功能開發。
>[OAuth API 的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/oauthRouter.js)  
>[Passport 設定的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/config/passport.js)


### 登入架構流程如下
 (以 Google 登入為例說明，Facebook 也是相同流程)：
![OAuth架構流程圖](https://i.imgur.com/AVzj0sF.png)

1. 當前端呼叫 Google Login 後，Server 透過 passport middleware 將 Client 重新引導至 Google 登入頁。
   ```js
    router.get(
        "/google",
        passport.authenticate("google", {
            scope: ["profile"], //希望獲得的資料範圍，profile代表個人資訊
        })
    );
   ```
2. Google 登入後，Google 服務會將 Client 引導至預先設定的 Callback Router，一併將使用者 profile 資料傳入。
   此時 req 被 passport middleware 攔截，並使用 [passport.js](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/config/passport.js) 中設定的 GoogleStrategy 解析資料。
   ```js
    router.get(
        "/google/redirect",
        passport.authenticate("google", { session: false }),
        (req, res) => {
            ...
        }
    );
   ```
3. [passport.js](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/config/passport.js) 的 Strategy 在 MySQL 資料庫找尋這個 oauth_id 使用者，若無則建立，並將 user 資料添加到 req.user 中。
4. 回到 Router 中建立 JWT token 並將前端引導至 login-success 頁面，同時在 queryString 中帶入 token 及 user data。
    ```js
    router.get(
        "/google/redirect",
        passport.authenticate("google", { session: false }),
        (req, res) => {
            // 建立 JWT
            const tokenObj = {
                userId: req.user.userId,
                name: req.user.user_name,
                permission: req.user.user_permission,
            };
            const token = jwt.sign(tokenObj, process.env.JWT_SECRET, {
            ex  piresIn: "12 h",
            });

            return res.redirect(
                `/oauth/login-success/?user=${JSON.parse(req.user)}&token=${"JWT " + token}`
            );
        }
    );
    ```
5. login-success 頁面是一個空畫面，會將 queryString 中的 user 存入 localStorage；token 存入 cookie 中，然後重新引導回到首頁，完成登入流程。 
   
    > **login-success page 設計目的？**  
    >
    > 在 OAuth 流程中，使用者被引導至 Google 的 Login Page，登入後再被引導回我們設定的 Callback Router。這個 Router 最後會需要做兩件事：將資料傳至前端、引導前端到首頁。  
    >
    > 然而 **無法在一個 Response 中同時 send 資料及 redirect**，因此設計一個 login-success 空頁面，取得 queryString 中資訊儲存至 storage、再引導 Client 至首頁。



## 三、JWT token 使用 & 權限控制
使用者登入後，瀏覽器會將 JWT token 存在 cookie 中，爾後所有的 request 傳送時都會自動在 header 中帶上。Server 端就是以這個 header cookie 中的 JWT token 來解析 token 有效性及判斷權限。

本專案使用 [passport](https://www.npmjs.com/package/passport)、[passport-jwt](https://www.npmjs.com/package/passport-jwt) 完成此功能

> [Passport 設定的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/config/passport.js)

### 3-1：JWT 權限控置流程圖如下：
![JWT 權限控置流程圖](https://i.imgur.com/S9iprem.png)
1. Request 的 Header cookie 中帶有 token 項目
2. passport middleware 判斷 token 有效性，無效則回傳 401 Unauthorizes
3. router 設定 user.permission 權限等級是否符合該功能需求，若不符合則回傳 403 Forbidden
4. 繼續執行設定的功能
   

### 3-2：Passport Middleware 設定
從 Request header 的 cookie 取出 token，由 JwtStrategy 解析 JWT 內容後，存入 req.user 中，供後續 router 使用。
```js
// /config/passport.js

const cookieTokenExtrator = (req) => {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    token = token.replace("JWT ", ""); // 去除空白及 jwt 前綴字
  }
  return token;
};

const opts = {};
opts.secretOrKey = process.env.JWT_SECRET;
opts.jwtFromRequest = cookieTokenExtrator; // 設定一個取得 jwt 的 method

passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        // 有辦法解析出 payload 就判斷為有效使用者
        if (jwt_payload == null) return done(null, false);
        else return done(null, jwt_payload); // 將資訊存入 req.user 中
    })
);
```

### 3-3：Router 使用 JWT 及權限控制
在部分需要使用身分認證的 router 中可以加上此 passport 的 middleware 解析 JWT，再使用 JWT payload 的使用者權限判斷是否能進行該操作。

以教師發布課程的 api 為例
1. `passport.authenticate` Middleware 解析 JWT
2. `req.user.permission` 判斷權限是否符合 (0-學生、1-教師、2-管理者)
```js

// 發布新課程 <POST> /api/course
router.post(
  "/",
  passport.authenticate("jwt", { session: false }), // Passport Middleware
  (req, res, next) => {
    // 確認權限是否為 admin 或 teacher
    if (req.user.permission < 1) return res.status(403).send("權限不足");

    //...後續操作
  }
);
```

### 3-4：JWT 失效處理
我使用 Passport 提供的 `failureRedirect` 功能，設定 Client 端瀏覽比較重要的 page 時需要使用有效的 token，否則會重新引導至 login page 。

進入 login page 會先清除 storage 舊的登入資料，並顯示錯誤訊息。

>目前的設定 Token 有效 12 小時


```js
// routes > pageRouter.js

/* 需要使用 JWT 驗證才可進入的頁面 */
/* 例如後台管理頁面 */

const token_fail_msg = "登入權證失效，請重新登入";

router.get(
  "/backend",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: `/login?msg=${token_fail_msg}`,
  }),
  (req, res) => {
    res.render("backend.ejs");
  }
);
```


## 四、課程管理後台
此後台僅有教師及管理者可以使用，進行課程新增/修改/刪除等操作。  
教師進入時會顯示屬於他的所有課程，管理者進入則顯示系統中所有課程。
> [Course API 的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/courseRouter.js)  

### 4-1：前端顯示所有課程功能
瀏覽器進入管理後台頁面時，會依序使用者身分呼叫 API
- 教師：\<GET\> /api/course/{teacherId} 
- 管理者：\<GET\> /api/course/

後端透過 MySQL 取得課程資料，並 JOIN user 資料後回傳

```js
// 取得所有課程
router.get("/", (req, res, next) => {
    mysql.query("SELECT course.id, course.name as name, course.description, course.price, user.id as teacherId, user.name as teacherName FROM `course` LEFT JOIN `user` ON course.teacherId = user.id", 
		(err, result) => {
      if (err) next(err);
      else return res.status(200).send(result);
    });
  })

// 選取老師的所有課程
router.get("/teacher/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query(
    "SELECT course.id, course.name as name, course.description, course.price, user.id as teacherId, user.name as teacherName FROM `course` LEFT JOIN `user` ON course.teacherId = user.id WHERE course_teacherId=?",
    [id],
    (err, result) => {
      if (err) next(err);
      else return res.status(200).send(result);
    }
  );
});
```
當前端取的回傳的資料後使用迴圈將課程一一顯示在 Table 中。如下圖
![課程管理後台介面](https://i.imgur.com/L4WVwcD.png)

### 4-2：新增課程
教師帳號可以透過 API \<POST\> /api/course 來新增課程，此 API 運作邏輯如下：
1. 確認 request header cookie 中的 JWT token 有效
2. 確認 user.permission 權限是否大於 1 (教師權限)，否則回傳 403 Forbidden
3. 新增課程資料至 MySQL 資料庫，回傳狀態 201 Created。
   
![課程新增介面](https://i.imgur.com/9DZ4zjD.png)

### 4-3：修改、刪除課程
修改課程與刪除課程同樣需要教師或管理者的權限才可以操作，透過 \<PUT\> /api/course/{id}、\<DELETE\> /api/course/{id}，兩 API 操作，流程如下：
1. 確認 request header cookie 中的 JWT token 有效
2. user.permission 如果是教師，將比對此帳號 id 以及課程 teacherId 是否相符；或如果是管理者帳號則允許直接操作。當若權限不足，會回傳 403 Forbidden。
3. 進行 MySQL 課程資料的修改或刪除，回傳 200 成功。
   
![課程修改刪除介面](https://i.imgur.com/yehkZzK.png)


## 五、購物車操作
在這個專案中，我設計使用 **Array 來儲存使用者購物車中的課程編號**，然而 MySQL 關聯性資料庫較不適合儲存陣列資料，因此我搭配 MongoDB 建立 Shopcart 資料表。
> [Shopcart API 的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/cartRouter.js)
> 
![Shopcart資料表](https://i.imgur.com/Cz02IQv.png)

### 5-1：取得購物車商品資料
前端透過 API \<GET\> /api/cart 取得購物車資料， router 運作流程如下：
1. 解析 request 中的 JWT token，將解析的 user 資料存到 req.user 中
2. 在 MongoDB 的 Shopcart 資料表中找到對應此 user.id 的資料，其中的 courseId_array 項目儲存購物車的課程編號。
3. 至 MySQL 撈取對應課程編號的課程資料
4. 回傳狀態 200 及課程資料陣列

### 5-2：新增購物車內容
前端透過 API \<POST\> /api/cart/{courseId} 新增購物車項目， router 運作流程如下：
1. 解析 request 中的 JWT token，將解析的 user 資料存到 req.user 中
2. 限制 req.user.permission 要為 0 (學生)，才可以進行此操作
3. 使用 mongoose 套件的 `findOneAndUpdate` 功能，尋找此帳號對應的購物車資料，並更新 courseId_array 內容。
    >其中此步驟加上參數：`$addToSet` 可以將課程編號加入 Array 並且不重複；`upsert: true` 代表當此帳號在 MongoDB 尚未建立對應資料時自動建立。
    ```js
    await Cart.findOneAndUpdate(
        { studentId: req.user.id },
        {
          $addToSet: { courseId_array: courseId },
        },
        {
          upsert: true, // 如果沒有這筆 document 自動新增
          new: true, // 回傳更新後的內容
        }
    );
   ```
4. 回傳 200 新增成功

### 5-3：刪除購物車內容
前端透過 API \<DELETE\> /api/cart/{courseId} 刪除購物車項目， router 運作流程如下：
1. 解析 request 中的 JWT token，將解析的 user 資料存到 req.user 中
2. 限制 req.user.permission 要為 0 (學生)，才可以進行此操作
3. 使用 mongoose 套件的 `findOneAndUpdate` 功能，尋找此帳號對應的購物車資料，並更新 courseId_array 內容。
    >其中此步驟加上參數：`$pull` 可以將課程編號從 Array 中刪除。對比另一個功能 `$pop`， `$pop` 後面需要的是想刪除的資料索引值；`$pull` 比較方便直接填入要刪除的項目內容即可。
    ```js
    await Cart.findOneAndUpdate(
        { studentId: req.user.id },
        {
          $pull: { courseId_array: courseId },
        },
        {
          new: true, // 回傳更新後的內容
        }
    );
   ```
4. 回傳 200 刪除成功


## 六、綠界付款
付款功能使用第三方支付 [綠界科技](https://www.ecpay.com.tw/Service/API_Dwnld) 的 [信用卡一次付清功能](https://developers.ecpay.com.tw/?p=2866) 服務，並搭配官方提供的 [ECPayAIO_Node.js](https://github.com/ECPay/ECPayAIO_Node.js) 套件開發金流串接功能。
> [綠界付款功能 的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/ecpayRouter.js)

### 6-1：呼叫付款服務
建立一個 API \<POST\> /ecpay/submitOrder 用來呼叫付款服務，在此 router 中會進行以下流程：
1. 解析 JWT token 獲得使用者資訊
2. 從 Request body 中取得要付款課程編號
3. 至 MySQL 中撈取這些課程的資訊，並計算總價、建立用於綠介服務的 itemName 字串 (綠界要求如果商品有多項，itemName 需寫成 "#商品A#商品B#商品C" 格式)。
4. 使用 ecpay_aio_nodejs 中的 ecpay_payment 功能建立付款頁面內容，詳細參數見下方程式：
   
   ```js
    const ecpay_payment = require("../node_modules/ecpay_aio_nodejs/lib/ecpay_payment");
    const options = require("../node_modules/ecpay_aio_nodejs/conf/config-example"); // 官方提供測試用的店家資訊
    ...

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
   ```
   >注意：  
   >付款成功後，綠界 Server 會將付款資訊回傳到 `ReturnURL`。然而本專案運行在 Localhost:300，無法從外部連接，因此需要設定 [Ngrok](https://ngrok.com/) 服務來讓外網連接本地的 URL 。

5. 將 htm 資料 res.send 回傳給前端並顯示在頁面上。此時畫面會變成綠界付款頁(本專案使用的是測試介接的設定選項)。
   ![綠界付款畫面](https://i.imgur.com/srseaLz.png)


### 6-2：付款測試
在測試介街的模式下，官方有提供測試用的新用卡號 ([測試介接資訊](https://developers.ecpay.com.tw/?p=2856))  
>一般信用卡測試卡號 : 4311-9522-2222-2222  
>卡片有效期限：隨便輸入只要超過現在都可以  
>安全碼 : 222  
>電話：任意有效電話都可以

### 6-3：付款成功後運作
付款成功後需要將已付款的課程項目從購物車刪除、並新增到我的課程中。  

那要如何讓我們的 Server 知道付款已經完成呢？就得靠第一步建立付款服務時設定的 `ReturnURL` 了。

1. 本專案中待付款完成後，綠界 Server 會將付款資訊傳到 `ReturnURL` ：localhost:3000/ecpay/pay_success。並且 `CustomField` 記錄付款使用者的 id 以及付款的課程編號 (這是在第一步設定的)。
2. Api router 針對 id 以及 課程編號來修改購物車及我的課程資料。
3. 最後回傳 "1|OK" 讓綠界 Server 知道付款流程完成。
   > 詳細一點還需要判斷回傳的 CheckMacValue 驗證碼是否正確 (參考 [驗證碼機制](https://developers.ecpay.com.tw/?p=2902))，但本專案沒做到這塊。
```js
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
```

