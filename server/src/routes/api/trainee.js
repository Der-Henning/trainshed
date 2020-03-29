"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { literal, Op } = require("sequelize");
const _ = require("lodash");

const traineeData = unitId => {
  return {
    attributes: [
      "id",
      [literal("`Person`.id"), "PersonId"],
      [literal("`Person`.name"), "name"],
      [literal("`Person`.givenName"), "givenName"],
      [literal("`Person`.persNum"), "persNum"],
      [literal("`Person`.UnitId"), "UnitId"],
      [literal("`Person->Unit`.name"), "unit"]
    ],
    include: [
      {
        model: models.Person,
        attributes: [],
        include: [{ model: models.Unit, attributes: [] }],
        where: unitId ? { UnitId: unitId } : {}
      }
    ],
    where: { PersonId: { [Op.not]: null } }
  };
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    var trainees = await models.Trainee.findAll(
      req.level < 50 ? traineeData(req.unitId) : traineeData()
    );
    res.status(200).send(errors.success(trainees));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) return next(new errors.MissingParameterError());
    var trainee = await models.Trainee.findByPk(id, traineeData());
    if (!trainee) return next(new errors.ResourceNotFoundError("Trainee"));
    res.status(200).send(errors.success(trainee));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
