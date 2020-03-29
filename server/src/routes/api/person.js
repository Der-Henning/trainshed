"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { literal } = require("sequelize");

const personData = unitId => {
  return {
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
    ],
    where: unitId ? { UnitId: unitId } : {}
  };
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    var persons = await models.Person.findAll(
      req.level < 50 ? personData(req.unitId) : personData()
    );
    res.status(200).send(errors.success(persons));
  } catch (err) {
    next(err);
  }
});

router.get("/findByPN/:PersNum", auth, async (req, res, next) => {
  var { PersNum } = req.params;
  var query = personData();

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!PersNum) return next(new errors.MissingParameterError());
    query.where["PersNum"] = PersNum;
    var person = await models.Person.findOne(query);
    if (!person) return next(new errors.ResourceNotFoundError("Person"));
    if (person.UnitId != req.unitId && req.level < 50)
      return next(new errors.UnauthorizedError());
    res.status(200).send(errors.success(person));
  } catch (err) {
    next(err);
  }
});

router.get("/find", auth, async (req, res, next) => {
  var query = req.level < 50 ? personData(req.unitId) : personData();

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    for (var key in req.body) query.where[key] = req.body[key];
    var persons = await models.Person.findAll(query);
    res.status(200).send(errors.success(persons));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var person = await models.Person.findByPk(id, personData());
    if (!person) return next(new errors.ResourceNotFoundError("Person"));
    if (person.UnitId != req.unitId && req.level < 50)
      return next(new errors.UnauthorizedError());
    res.status(200).send(errors.success(person));
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  const keys = ["persNum", "name", "givenName", "UnitId", "rank", "mail"];
  var data = {};

  try {
    keys.forEach(key => {
      if (req.body[key]) data[key] = req.body[key];
    });
    data.Trainee = {};
    if (req.level < 30 || (req.unitId !== data.UnitId && req.level < 60))
      return next(new errors.UnauthorizedError());
    if (!data.persNum || !data.name || !data.givenName || !data.UnitId)
      return next(new errors.MissingParameterError());
    var person = await models.Person.create(data, {
      include: [{ model: models.Trainee }]
    });
    person = await models.Person.findByPk(person.id, personData());
    res.status(200).send(errors.success(person));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const keys = ["persNum", "name", "givenName", "UnitId", "rank", "mail"];
  var data = {};

  try {
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
    var person = await models.Person.findByPk(id);
    if (!person) return next(errors.ResourceNotFoundError("Person"));
    if (req.level < 30 || (req.unitId !== person.UnitId && req.level < 60))
      return next(new errors.UnauthorizedError());
    keys.forEach(key => {
      if (data[key]) person[key] = data[key];
    });
    await person.save();
    person = await models.Person.findByPk(id, personData());
    res.status(200).send(errors.success(person));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!id) return next(new errors.MissingParameterError());
    var person = await models.Person.findByPk(id);
    if (req.level < 60 && person.UnitId !== req.unitId)
      return next(new errors.UnauthorizedError());
    if (!person) return next(new errors.ResourceNotFoundError("Person"));
    await person.destroy();
    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
