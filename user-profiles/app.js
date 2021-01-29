var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const strategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("connect-flash");
const { Strategy } = require("passport-local");

var app = express();

MongoClient.connect(
  "mongodb+srv://<username>:<password>@user-profiles.u30dj.mongodb.net/<dbname>?retryWrites=true&w=majority",
  (err, client) => {
    if (err) {
      throw err;
    }

    const db = client.db("user-profiles");
    const users = db.collection("users");
    app.locals.users = users;
  }
);

passport.use(
  new Strategy((username, password, done) => {
    app.locals.users.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null);
      }
      if (user.password != password) {
        return done(null);
      }
      return done(null, user);
    });
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
