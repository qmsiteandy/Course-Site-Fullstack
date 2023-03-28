const { use } = require("passport");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const mysql = require("./mysqlConnection");

// passport.serializeUser(function (user, done) {
//   console.log("serializeUser user = ", user);
//   done(null, user.userId);
// });

// passport.deserializeUser(function (userId, done) {
//   console.log("deserializeUser userId = ", userId);
//   mysql.query("SELECT * FROM user WHERE userId=?", [userId], (err, results) => {
//     if (err) return done(err, false);
//     if (results[0] == null) return done(null, false);
//     else {
//       return done(null, results[0]);
//     }
//   });
// });

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("jwt_payload", jwt_payload);
    mysql.query(
      "SELECT * FROM user WHERE userId=?",
      [jwt_payload.userId],
      (err, results) => {
        if (err) return done(err, false);
        if (results[0] == null) return done(null, false);
        else {
          return done(null, results[0]);
        }
      }
    );
  })
);

module.exports = passport;
