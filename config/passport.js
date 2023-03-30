const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mysql = require("./mysqlConnection");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.JWT_SECRET;

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
            return cb(err, JSON.parse(JSON.stringify(results[0])));
          }
          // // 使用者不存在，建立新資料
          else {
            mysql.query(
              "INSERT INTO user (user_name, oauth_id) VALUE(?,?)",
              [
                profile.name.familyName + " " + profile.name.givenName,
                profile.id,
              ],
              (error, results, fields) => {
                if (error) throw error;
                cb(null, {
                  userID: results.insertId,
                  user_name:
                    profile.name.familyName + " " + profile.name.givenName,
                  user_permission: 0,
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
            return cb(err, JSON.parse(JSON.stringify(results[0])));
          }
          // // 使用者不存在，建立新資料
          else {
            mysql.query(
              "INSERT INTO user (user_name, oauth_id) VALUE(?,?)",
              [profile.displayName, profile.id],
              (error, results, fields) => {
                if (error) throw error;
                cb(null, {
                  userID: results.insertId,
                  user_name: profile.displayName,
                  user_permission: 0,
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
