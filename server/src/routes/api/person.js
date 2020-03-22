"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { literal } = require("sequelize");

const personData = {
  attributes: [
    "id",
    "name",
    "givenName",
    "persNum",
    "rank",
    "mail",
    "UnitId",
    [literal("`Unit`.name"), "unit"],
    [literal("`Trainer`.id"), "TrainerId"],
    [literal("`Trainee`.id"), "TraineeId"]
  ],
  include: [
    { model: models.Unit, attributes: [] },
    { model: models.Trainer, attributes: [] },
    { model: models.Trainee, attributes: [] }
  ]
};

router.get("/", auth, (req, res, next) => {
  if (req.level < 30) throw new errors.UnauthorizedError();
  models.Person.findAll(
    personData,
    req.level < 50 ? { where: { UnitId: req.unitId } } : {}
  )
    .then(persons => {
      res.status(200).send(errors.success(persons));
    })
    .catch(error => next(error));
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 30) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.Person.findByPk(id, personData)
    .then(person => {
      if (!person) throw new errors.ResourceNotFoundError("Person");
      if (person.UnitId != req.unitId && req.level < 50)
        throw new errors.UnauthorizedError();
      res.status(200).send(errors.success(person));
    })
    .catch(error => next(error));
});

router.post("/", auth, async (req, res, next) => {
  const keys = ["persNum", "name", "givenName", "UnitId", "rank", "mail"];
  var data = {};
  keys.forEach(key => {
    if (req.body[key]) data[key] = req.body[key];
  });
  data.Trainee = {};

  if (req.level < 30 || (req.unitId !== data.UnitId && req.level < 60))
    return next(new errors.UnauthorizedError());
  if (!data.persNum || !data.name || !data.givenName || !data.UnitId)
    return next(new errors.MissingParameterError());

  models.Person.create(data, {
    include: [{ model: models.Trainee }]
  })
    .then(person => {
      models.Person.findByPk(person.id, personData).then(person => {
        res.status(200).send(errors.success(person));
      });
    })
    .catch(error => next(error));
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const keys = ["persNum", "name", "givenName", "UnitId", "rank", "mail"];
  var data = {};
  keys.forEach(key => {
    if (req.body.data[key]) data[key] = req.body.data[key];
  });

  if (
    !id ||
    !(
      data.persNum ||
      data.name ||
      data.givenName ||
      data.rank ||
      data.mail ||
      data.UnitId
    )
  )
    return next(new errors.MissingParameterError());

  models.Person.findByPk(id)
    .then(async person => {
      if (!person) return next(errors.ResourceNotFoundError("Person"));
      if (req.level < 30 || (req.unitId !== person.UnitId && req.level < 60))
        return next(new errors.UnauthorizedError());
      keys.forEach(async key => {
        if (data[key]) person[key] = data[key];
      });
      person
        .save()
        .then(() => {
          models.Person.findByPk(id, personData)
            .then(person => {
              res.status(200).send(errors.success(person));
            })
            .catch(error => next(error));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

router.delete("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 30) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.Person.findByPk(id)
    .then(person => {
      if (req.level < 60 && person.UnitId !== req.unitId)
        throw new errors.UnauthorizedError();
      if (!person) throw new errors.ResourceNotFoundError("Person");
      person.destroy().then(() => {
        res.status(200).send(errors.success());
      });
    })
    .catch(error => next(error));
});

module.exports = router;
