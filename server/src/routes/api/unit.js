"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");

const unitData = {
  attributes: ["id", "name"]
};

router.get("/", auth, (req, res, next) => {
  if (req.level < 10) throw new errors.UnauthorizedError();
  models.Unit.findAll(unitData)
    .then(units => {
      res.status(200).send(errors.success(units));
    })
    .catch(error => next(error));
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 10) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.Unit.findByPk(id, unitData).then(unit => {
    if (!unit) throw new errors.ResourceNotFoundError("Unit");
    res.status(200).send(errors.success(unit));
  });
});

router.post("/", auth, (req, res, next) => {
  const { name } = req.body;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!name) throw new errors.MissingParameterError();
  models.Unit.create({
    name: name
  })
    .then(() => {
      models.Unit.findAll(unitData)
        .then(units => {
          res.status(200).send(errors.success(units));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

router.put("/:id", auth, (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!id || !name) throw new errors.MissingParameterError();
  models.Unit.findByPk(id).then(unit => {
    if (!unit) throw new errors.ResourceNotFoundError("Unit");
    unit.name = name || unit.name;
    unit
      .save()
      .then(() => {
        models.Unit.findAll(unitData).then(units => {
          res.status(200).send(errors.success(units));
        });
      })
      .catch(error => next(error));
  });
});

router.delete("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.Unit.findByPk(id)
    .then(unit => {
      if (!unit) throw new errors.ResourceNotFoundError("Unit");
      unit
        .destroy()
        .then(() => {
          models.Unit.findAll(unitData)
            .then(units => {
              res.status(200).send(errors.success(units));
            })
            .catch(error => next(error));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

module.exports = router;
