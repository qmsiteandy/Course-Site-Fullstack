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


## JWT token 使用 & 權限控制
使用者登入後，瀏覽器會將 JWT token 存在 cookie 中，爾後所有的 request 傳送時都會自動在 header 中帶上。Server 端就是以這個 header cookie 中的 JWT token 來解析 token 有效性及判斷權限。

本專案使用 [passport](https://www.npmjs.com/package/passport)、[passport-jwt](https://www.npmjs.com/package/passport-jwt) 完成此功能

> [Passport 設定的程式碼](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/config/passport.js)

### JWT 權限控置流程圖如下：
![JWT 權限控置流程圖](https://i.imgur.com/S9iprem.png)
1. Request 的 Header cookie 中帶有 token 項目
2. passport middleware 判斷 token 有效性，無效則回傳 401 Unauthorizes
3. router 設定 user.permission 權限等級是否符合該功能需求，若不符合則回傳 403 Forbidden
4. 繼續執行設定的功能
   

### Passport Middleware 設定
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

### Router 使用 JWT 及權限控制
在部分需要使用身分認證的 router 中可以加上此 passport jwt 的 middleware 解析 JWT，再使用 JWT payload 儲存的使用者權限判斷是否能進行該操作。

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


## 課程管理後台

## 購物車操作

## 綠界付款






