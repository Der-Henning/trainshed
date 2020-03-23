"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";

const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const models = require("./models");
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const config = require("./config");

const server = express();

var port = normalizePort(config.port || "4000");

server.use(bodyparser.urlencoded({ extended: true }));

server.use("/", indexRouter);
server.use("/api/v1", apiRouter);
server.use(express.static(path.join(__dirname, "../../client/build")));

server.use(function(err, req, res, next) {
  console.log(err);
  res.status(500).send("Something broke!");
});

models.sequelize.sync().then(() => {
  models.User.createAdmin(models);
  server.listen(port, () => {
    console.log("Express server listening on port " + port);
  });
});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
