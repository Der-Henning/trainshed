"use strict";

const router = require("express").Router();
const sequelize = require("sequelize");
const errors = require("../middleware/errors");
const personRouter = require("./api/person");
const trainerRouter = require("./api/trainer");
const traineeRouter = require("./api/trainee");
const trainingRouter = require("./api/training");
const unitRouter = require("./api/unit");
const trainingTypeRouter = require("./api/trainingType");
const userRouter = require("./api/user");

router.get("/", function(req, res, next) {
  res.status(200).send("Welcome to Training Sheduler API!");
});

router.use("/person", personRouter);
router.use("/trainer", trainerRouter);
router.use("/trainee", traineeRouter);
router.use("/training", trainingRouter);
router.use("/unit", unitRouter);
router.use("/trainingType", trainingTypeRouter);
router.use("/user", userRouter);

router.use((err, req, res, next) => {
  if (err instanceof sequelize.ConnectionRefusedError)
    res.status(500).send(errors.error(20, "Database offline"));
  else if (err instanceof sequelize.DatabaseError)
    res.status(500).send(errors.error(21, "Database Error"));
  else if (err instanceof errors.MissingParameterError)
    res.status(400).send(errors.error(10, "Missing Parameter(s)"));
  else if (err instanceof errors.ResourceNotFoundError)
    res
      .status(400)
      .send(errors.error(11, err.data.resource + " does not exist"));
  else if (err instanceof errors.AuthenticationError)
    res.status(400).send(errors.error(12, "Authentication Failed"));
  else if (err instanceof errors.UnauthorizedError)
    res.status(400).send(errors.error(13, "No Access"));
  else if (err instanceof errors.MaximumTraineesError)
    res.status(400).send(errors.error(16, "Maximum Trainees exeeded"));
  else if (err instanceof errors.TrainingNotOpenError)
    res.status(400).send(errors.error(17, "Can only book on open Trainings"));
  else if (err instanceof sequelize.UniqueConstraintError)
    res.status(400).send(errors.error(14, err.errors[0].message));
  else if (err instanceof sequelize.ValidationError)
    res.status(400).send(errors.error(15, err.errors[0].message));
  else res.status(500).send(errors.error(99, "Internel Server Error"));

  console.log(err);
});

module.exports = router;
