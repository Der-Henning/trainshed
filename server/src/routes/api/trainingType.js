"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");

const trainingTypeData = {
  attributes: ["id", "type"]
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    var trainingTypes = await models.TrainingType.findAll(trainingTypeData);
    res.status(200).send(errors.success(trainingTypes));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var trainingType = await models.TrainingType.findByPk(id, trainingTypeData);
    if (!trainingType)
      return next(new errors.ResourceNotFoundError("Training Type"));
    res.status(200).send(errors.success(trainingType));
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  const { type } = req.body;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!type) return next(new errors.MissingParameterError());
    await models.TrainingType.create({
      type: type
    });
    var trainingTypes = await models.TrainingType.findAll(trainingTypeData);
    res.status(200).send(errors.success(trainingTypes));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.body;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!id || !type) return next(new errors.MissingParameterError());
    var trainingType = await models.TrainingType.findByPk(id);
    if (!trainingType)
      return next(new errors.ResourceNotFoundError("Training Type"));
    trainingType.name = name || trainingType.name;
    await trainingType.save();
    var trainingTypes = await models.TrainingType.findAll(trainingTypeData);
    res.status(200).send(errors.success(trainingTypes));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 90) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var trainingType = await models.TrainingType.findByPk(id);
    if (!trainingType)
      return next(new errors.ResourceNotFoundError("Training Type"));
    await trainingType.destroy();
    var trainingTypes = await models.TrainingType.findAll(trainingTypeData);
    res.status(200).send(errors.success(trainingTypes));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
