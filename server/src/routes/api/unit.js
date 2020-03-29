"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");

const unitData = {
  attributes: ["id", "name"]
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    var units = await models.Unit.findAll(unitData);
    res.status(200).send(errors.success(units));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var unit = await models.Unit.findByPk(id, unitData);
    if (!unit) return next(new errors.ResourceNotFoundError("Unit"));
    res.status(200).send(errors.success(unit));
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  const { name } = req.body;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!name) return next(new errors.MissingParameterError());
    await models.Unit.create({
      name: name
    });
    var units = await models.Unit.findAll(unitData);
    res.status(200).send(errors.success(units));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!id || !name) return next(new errors.MissingParameterError());
    var unit = await models.Unit.findByPk(id);
    if (!unit) return next(new errors.ResourceNotFoundError("Unit"));
    unit.name = name || unit.name;
    await unit.save();
    var units = await models.Unit.findAll(unitData);
    res.status(200).send(errors.success(units));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var unit = await models.Unit.findByPk(id);
    if (!unit) return next(new errors.ResourceNotFoundError("Unit"));
    await unit.destroy();
    var units = await models.Unit.findAll(unitData);
    res.status(200).send(errors.success(units));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
