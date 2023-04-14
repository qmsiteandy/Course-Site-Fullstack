const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mysql = require("./mysqlConnection");

const cookieTokenExtrator = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
    token = token.replace(["jwt", " "], ""); // 去除空白及 jwt 前綴字
  }
  return token;
};

const opts = {};
opts.secretOrKey = process.env.JWT_SECRET;
opts.jwtFromRequest = cookieTokenExtrator; // 設定一個取得 jwt 的 method

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    if (jwt_payload == null) return done(null, false);
    else return done(null, jwt_payload);
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth/google/redirect",
    },
    function (accessToken, refreshToken, profile, cb) {
      mysql.query(
        "SELECT * FROM user WHERE oauth_id=?",
        [profile.id],
        (err, results) => {
          // 使用者已存在
          if (results && results[0]) {
            return cb(err, {
              id: results[0].id,
              name: results[0].name,
              permission: results[0].permission,
            });
          }
          // // 使用者不存在，建立新資料
          else {
            mysql.query(
              "INSERT INTO user (name, oauth_id) VALUE(?,?)",
              [
                profile.name.familyName + " " + profile.name.givenName,
                profile.id,
              ],
              (error, results, fields) => {
                if (error) throw error;
                cb(null, {
                  id: results.insertId,
                  name: profile.name.familyName + " " + profile.name.givenName,
                  permission: 0,
                });
              }
            );
          }
        }
      );
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/oauth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      mysql.query(
        "SELECT * FROM user WHERE oauth_id=?",
        [profile.id],
        (err, results) => {
          // 使用者已存在
          if (results && results[0]) {
            return cb(err, {
              id: results[0].id,
              name: results[0].name,
              permission: results[0].permission,
            });
          }
          // // 使用者不存在，建立新資料
          else {
            mysql.query(
              "INSERT INTO user (name, oauth_id) VALUE(?,?)",
              [profile.displayName, profile.id],
              (error, results, fields) => {
                if (error) throw error;
                cb(null, {
                  id: results.insertId,
                  name: profile.displayName,
                  permission: 0,
                });
              }
            );
          }
        }
      );
    }
  )
);

module.exports = passport;
