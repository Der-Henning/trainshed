"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");

const trainingTypeData = {
  attributes: ["id", "type"]
};

router.get("/", auth, (req, res, next) => {
  if (req.level < 10) throw new errors.UnauthorizedError();
  models.TrainingType.findAll(trainingTypeData)
    .then(trainingTypes => {
      res.status(200).send(errors.success(trainingTypes));
    })
    .catch(error => next(error));
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 10) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.TrainingType.findByPk(id, trainingTypeData).then(trainingType => {
    if (!trainingType) throw new errors.ResourceNotFoundError("Training Type");
    res.status(200).send(errors.success(trainingType));
  });
});

router.post("/", auth, (req, res, next) => {
  const { type } = req.body;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!type) throw new errors.MissingParameterError();
  models.TrainingType.create({
    type: type
  })
    .then(() => {
      models.TrainingType.findAll(trainingTypeData)
        .then(trainingTypes => {
          res.status(200).send(errors.success(trainingTypes));
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

router.put("/:id", auth, (req, res, next) => {
  const { id } = req.params;
  const { type } = req.body;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!id || !type) throw new errors.MissingParameterError();
  models.TrainingType.findByPk(id).then(trainingType => {
    if (!trainingType) throw new errors.ResourceNotFoundError("Training Type");
    trainingType.name = name || trainingType.name;
    trainingType
      .save()
      .then(() => {
        models.TrainingType.findAll(trainingTypeData).then(trainingTypes => {
          res.status(200).send(errors.success(trainingTypes));
        });
      })
      .catch(error => next(error));
  });
});

router.delete("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 90) throw new errors.UnauthorizedError();
  if (!id) throw new errors.MissingParameterError();
  models.TrainingType.findByPk(id)
    .then(trainingType => {
      if (!trainingType)
        throw new errors.ResourceNotFoundError("Training Type");
      trainingType
        .destroy()
        .then(() => {
          models.TrainingType.findAll(trainingTypeData).then(trainingTypes => {
            res.status(200).send(errors.success(trainingTypes));
          });
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

module.exports = router;
