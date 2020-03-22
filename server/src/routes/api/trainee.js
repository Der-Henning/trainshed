"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { Op } = require("sequelize");
const _ = require("lodash");

const traineeData = {
  attributes: ["id"],
  include: [
    { model: models.Person, attributes: ["id", "name", "givenName", "persNum"] }
  ],
  where: { PersonId: { [Op.not]: null } }
};

router.get("/", auth, (req, res, next) => {
  models.Trainee.findAll(traineeData)
    .then(trainees => {
      res.status(200).send(errors.success(trainees));
    })
    .catch(error => next(error));
});

router.get("/findBy", auth, async (req, res, next) => {
  const { where } = req.body;

console.log(_.merge(traineeData, {where: where}));


  try {
    var trainees = await models.Trainee.findAll(_.merge(traineeData, {where: where}));

    if (!trainees) return next(new errors.ResourceNotFoundError("Trainees"));
    res.status(200).send(errors.success(trainees));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, (req, res, next) => {
  const { id } = req.params;

  if (id) {
    models.Trainee.findByPk(id, traineeData)
      .then(trainee => {
        if (trainee) {
          res.status(200).send(errors.success(trainee));
        } else throw new errors.ResourceNotFoundError("Trainee");
      })
      .catch(error => next(error));
  } else throw new errors.MissingParameterError();
});



module.exports = router;
