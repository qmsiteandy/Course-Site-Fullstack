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
## 目錄：  
[使用者註冊/登入/登出](#一使用者註冊登入登出)  
[OAuth 登入](#二oauth-登入)



## 一、使用者註冊/登入/登出
>[User API 的程式連結](https://github.com/qmsiteandy/Course-Site-Fullstack/blob/master/routes/userRouter.js)

### 註冊：
當前端 From 註冊表單送出時呼叫後端 \<POST\> /api/user，API 運作邏輯：
1. 檢查傳入資訊是否缺漏 (必須包含 name、account、password 三樣)
2. 檢查此帳號是否已存在於 MySQL 資料庫中
3. 使用 bcrypt 套件進行密碼加密
4. 將輸入資料以及加密後的密碼存入 MySQL
5. 回傳狀態碼 201 註冊成功，或是 400 註冊失敗
   
### 登入：
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

### 登出：
因為前端是使用 storage 內容來判斷是否為登入狀態，因此登出時只需要將 cookie 及 localStorage 刪除即可。


## 二、OAuth 登入

## JWT token 使用 & 權限控制

## 課程管理後台

## 購物車操作

## 綠界付款






