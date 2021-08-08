'use strict';

const functions = require("firebase-functions");
const express = require("express");
const app1 = express();
const path = require('path');
const sessionParser = require('express-session');
const bodyParser = require('body-parser');

app1.set("view engine", "ejs");
app1.set('views', path.join(__dirname, 'views'));
app1.use(express.static(__dirname + "/public"));
app1.engine("ejs", require("ejs").__express);
app1.use(bodyParser.json({ limit: "50mb" }));
app1.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app1.use(sessionParser({
  secret: 'secret key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 10 * 10,
  }
}));

/* Route設定 */
app1.use("/", require("./routes/client/main"));

const api1 = functions.https.onRequest(app1);

module.exports = {
  api1
};
