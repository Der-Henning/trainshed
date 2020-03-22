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
    [literal("`Unit`.name"), "unit"]
  ],
  include: [{ model: models.Unit, attributes: [] }]
};

router.get("/", auth, (req, res, next) => {
  if (req.level < 90) throw new errors.UnauthorizedError();
  models.User.findAll(userData)
    .then(users => {
      res.status(200).send(errors.success(users));
    })
    .catch(error => next(error));
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (!(id == req.userId || req.level >= 90))
    throw new errors.UnauthorizedError();
  models.User.findByPk(id, userData)
    .then(user => {
      if (!user) throw new errors.ResourceNotFoundError("User");
      res.status(200).send(errors.success(user));
    })
    .catch(error => next(error));
});

router.post("/authenticate", (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) throw new errors.MissingParameterError();
  models.User.findOne({ where: { username: username } })
    .then(user => {
      if (!user) throw new errors.ResourceNotFoundError("User", "");
      if (!bcrypt.compareSync(password, user.password))
        throw new errors.AuthenticationError();
      const token = jwt.sign(
        { userId: user.id, level: user.level, unitId: user.UnitId },
        config.myprivatekey
      );
      res
        .status(200)
        .header("x-auth-token", token)
        .send(errors.success({ level: user.level }));
    })
    .catch(error => next(error));
});

router.post("/", auth, async (req, res, next) => {
  const { unit } = req.body;
  const keys = ["username", "password", "mail", "level", "UnitId"];
  var data = {};
  keys.forEach(key => {
    if (req.body[key]) data[key] = req.body[key];
  });

  if (req.level < 90) return next(new errors.UnauthorizedError());
  if (!data.username || !data.password) return next(new errors.MissingParameterError());

  if (unit) {
    await models.Unit.findOne({ where: { name: unit } })
      .then(unit => {
        if (!unit) return next(new errors.ResourceNotFoundError("Unit"));
        data.UnitId = unit.id;
      })
      .catch(error => next(error));
  }

  if (data.password) data.password = await bcrypt.hash(data.password, 10);

  models.User.create(data)
    .then(user => {
      models.User.findByPk(user.id, userData)
        .then(user => {
          res.status(200).send(errors.success(user));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const { unit } = req.body.data;
  const keys = ["username", "password", "mail", "level", "UnitId"];
  var data = {};
  keys.forEach(key => {
    if (req.body.data[key]) data[key] = req.body.data[key];
  });

  if (!(id == req.userId || req.level >= 90))
    return next(new errors.UnauthorizedError());
  if (!id || !(data.level || data.password || data.mail || unit))
    return next(new errors.MissingParameterError());

  if (unit) {
    await models.Unit.findOne({ where: { name: unit } })
      .then(unit => {
        if (!unit) return next(new errors.ResourceNotFoundError("Unit"));
        data.UnitId = unit.id;
      })
      .catch(error => next(error));
  }

  if (data.password) data.password = await bcrypt.hash(data.password, 10);

  models.User.findByPk(id)
    .then(async user => {
      if (!user) return next(errors.ResourceNotFoundError("User"));
      if (user.username === "admin" && data.username !== "admin") return next(new errors.UnauthorizedError());
      keys.forEach(async key => {
        if (data[key]) user[key] = data[key];
        user.UnitId = data.UnitId ? data.UnitId : null;
      });

      user
        .save()
        .then(() => {
          models.User.findByPk(id, userData)
            .then(user => {
              res.status(200).send(errors.success(user));
            })
            .catch(error => next(error));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

router.delete("/:id", auth, (req,res,next) => {
  const { id } = req.params;
  
  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.User.findByPk(id)
    .then(user => {
      if (!user) throw new errors.ResourceNotFoundError("User");
      if (user.username === "admin") throw new errors.UnauthorizedError();
      user
        .destroy()
        .then(() => {
          models.User.findAll(userData)
            .then(users => {
              res.status(200).send(errors.success(users));
            })
            .catch(error => next(error));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
})

module.exports = router;
