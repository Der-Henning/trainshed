"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { Op } = require("sequelize");

const trainerData = {
  attributes: ["id", "trainer", "examiner"],
  include: [
    { model: models.Person, attributes: ["id", "name", "givenName", "persNum"] }
  ],
  where: { PersonId: { [Op.not]: null } }
};

router.get("/", auth, (req, res, next) => {
  if (req.level < 50) throw new errors.UnauthorizedError();
  models.Trainer.findAll(trainerData)
    .then(trainers => {
      res.status(200).send(errors.success(trainers));
    })
    .catch(error => next(error));
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 50) throw new errors.UnauthorizedError();
  if (id) {
    models.Trainer.findByPk(id, trainerData)
      .then(trainer => {
        if (trainer) {
          res.status(200).send(errors.success(trainer));
        } else throw new errors.ResourceNotFoundError("Trainer");
      })
      .catch(error => next(error));
  } else throw new errors.MissingParameterError();
});

router.post("/:personId", auth, (req, res, next) => {
  const { personId } = req.params;

  if (req.level < 60) throw new errors.UnauthorizedError();
  if (personId) {
    models.Person.findByPk(personId)
      .then(person => {
        if (person) {
          models.Trainer.create({ PersonId: personId })
            .then(trainer => {
              models.Trainer.findByPk(trainer.id, trainerData).then(trainer => {
                res.status(200).send(errors.success(trainer));
              });
            })
            .catch(error => next(error));
        } else throw new errors.ResourceNotFoundError("Person");
      })
      .catch(error => next(error));
  } else throw new errors.MissingParameterError();
});

router.put("/:id", auth, (req, res, next) => {
  const { id } = req.params;
  const { bolTrainer, bolExaminer } = req.body;

  if (req.level < 60) throw new errors.UnauthorizedError();
  if (id) {
    models.Trainer.findByPk(id)
      .then(trainer => {
        if (trainer) {
          trainer.trainer = bolTrainer || trainer.trainer;
          trainer.examiner = bolExaminer || trainer.examiner;
          trainer
            .save()
            .then(trainer => {
              res.status(200).send(errors.success(trainer));
            })
            .catch(error => next(error));
        } else throw new errors.ResourceNotFoundError("Trainer");
      })
      .catch(error => next(error));
  } else throw new errors.MissingParameterError();
});

router.delete("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (req.level < 60) throw new errors.UnauthorizedError();
  if (id) {
    models.Trainer.findByPk(id)
      .then(trainer => {
        if (trainer) {
          trainer.PersonId = null;
          trainer
            .save()
            .then(() => {
              res.status(200).send(errors.success(null));
            })
            .catch(error => next(error));
        } else throw new errors.ResourceNotFoundError("Trainer");
      })
      .catch(error => next(error));
  } else throw new errors.MissingParameterError();
});

module.exports = router;
