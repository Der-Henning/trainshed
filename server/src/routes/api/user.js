"use strict";

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../../models");
const errors = require("../../middleware/errors");
const config = require("../../config");
const auth = require("../../middleware/auth");
const { literal } = require("sequelize");

const userData = {
  attributes: [
    "id",
    "username",
    "level",
    "mail",
    "UnitId",
    [literal("`Unit`.name"), "unit"]
  ],
  include: [{ model: models.Unit, attributes: [] }]
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    var users = await models.User.findAll(userData);
    res.status(200).send(errors.success(users));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!(id == req.userId || req.level >= 90))
      return next(new errors.UnauthorizedError());
    var user = await models.User.findByPk(id, userData);
    if (!user) return next(new errors.ResourceNotFoundError("User"));
    res.status(200).send(errors.success(user));
  } catch (err) {
    next(err);
  }
});

router.post("/authenticate", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) return next(new errors.MissingParameterError());
    var user = await models.User.findOne({ where: { username: username } });
    if (!user) return next(new errors.ResourceNotFoundError("User"));
    if (!bcrypt.compareSync(password, user.password))
      return next(new errors.AuthenticationError());
    const token = jwt.sign(
      { userId: user.id, level: user.level, unitId: user.UnitId },
      config.myprivatekey
    );
    res
      .status(200)
      .header("x-auth-token", token)
      .send(errors.success({ level: user.level }));
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  const keys = ["username", "password", "mail", "level", "UnitId"];
  var data = {};

  try {
    keys.forEach(key => {
      if (req.body[key]) data[key] = req.body[key];
    });
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!data.username || !data.password)
      return next(new errors.MissingParameterError());
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    var user = await models.User.create(data);
    user = await models.User.findByPk(user.id, userData);
    res.status(200).send(errors.success(user));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const keys = ["username", "password", "mail", "level", "UnitId"];
  var data = {};

  try {
    keys.forEach(key => {
      if (req.body.data[key]) data[key] = req.body.data[key];
    });
    if (!(id == req.userId || req.level >= 90))
      return next(new errors.UnauthorizedError());
    if (!id || !(data.level || data.password || data.mail || data.UnitId))
      return next(new errors.MissingParameterError());
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    var user = await models.User.findByPk(id);
    if (!user) return next(errors.ResourceNotFoundError("User"));
    if (user.username === "admin" && data.username !== "admin")
      return next(new errors.UnauthorizedError());
    keys.forEach(key => {
      if (data[key]) user[key] = data[key];
      user.UnitId = data.UnitId ? data.UnitId : null;
    });
    await user.save();
    user = await models.User.findByPk(id, userData);
    res.status(200).send(errors.success(user));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var user = await models.User.findByPk(id);
    if (!user) return next(new errors.ResourceNotFoundError("User"));
    if (user.username === "admin") return next(new errors.UnauthorizedError());
    await user.destroy();
    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
