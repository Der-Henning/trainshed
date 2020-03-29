"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { Op, literal } = require("sequelize");

const trainerData = {
  attributes: [
    "id",
    "trainer",
    "examiner",
    [literal("`Person`.id"), "PersonId"],
    [literal("`Person`.persNum"), "persNum"],
    [literal("`Person`.name"), "name"],
    [literal("`Person`.givenName"), "givenName"],
    [literal("`Person`.rank"), "rank"]
  ],
  include: [
    {
      model: models.Person,
      attributes: []
    }
  ],
  where: { PersonId: { [Op.not]: null } }
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    var trainers = await models.Trainer.findAll(trainerData);
    res.status(200).send(errors.success(trainers));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var trainer = await models.Trainer.findByPk(id, trainerData);
    if (!trainer) return next(new errors.ResourceNotFoundError("Trainer"));
    res.status(200).send(errors.success(trainer));
  } catch (err) {
    next(err);
  }
});

router.post("/:personId", auth, async (req, res, next) => {
  const { personId } = req.params;

  try {
    if (req.level < 60) return next(new errors.UnauthorizedError());
    if (!personId) return next(new errors.MissingParameterError());
    var person = await models.Person.findByPk(personId);
    if (!person) return next(new errors.ResourceNotFoundError("Person"));
    var trainer = await models.Trainer.create({ PersonId: personId });
    trainer = await models.Trainer.findByPk(trainer.id, trainerData);
    res.status(200).send(errors.success(trainer));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const { bolTrainer, bolExaminer } = req.body;

  try {
    if (req.level < 60) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var trainer = await models.Trainer.findByPk(id, trainerData);
    if (!trainer) return next(new errors.ResourceNotFoundError("Trainer"));
    trainer.trainer = bolTrainer || trainer.trainer;
    trainer.examiner = bolExaminer || trainer.examiner;
    await trainer.save();
    res.status(200).send(errors.success(trainer));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 60) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var trainer = await models.Trainer.findByPk(id);
    if (!trainer) return next(new errors.ResourceNotFoundError("Trainer"));
    trainer.PersonId = null;
    await trainer.save();
    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
