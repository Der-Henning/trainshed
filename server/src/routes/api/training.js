"use strict";

const router = require("express").Router();
const models = require("../../models");
const auth = require("../../middleware/auth");
const errors = require("../../middleware/errors");
const { literal, fn, col } = require("sequelize");

const trainingData = {
  attributes: [
    "id",
    "startDate",
    "endDate",
    "maxTrainees",
    "minTrainees",
    "status",
    "reason",
    [literal("`TrainingType`.type"), "trainingType"]
  ],
  order: [["startDate", "ASC"]],
  include: [
    {
      model: models.TrainingTrainer,
      as: "Trainers",
      attributes: [
        "id",
        [literal("`Trainers`.status"), "status"],
        [literal("`Trainers->Trainer`.trainer"), "trainer"],
        [literal("`Trainers->Trainer`.examiner"), "examiner"],
        [literal("`Trainers->Trainer`.id"), "trainerId"],
        [literal("`Trainers->Trainer->Person`.id"), "personId"],
        [literal("`Trainers->Trainer->Person`.persNum"), "persNum"],
        [literal("`Trainers->Trainer->Person`.name"), "name"],
        [literal("`Trainers->Trainer->Person`.rank"), "rank"],
        [literal("`Trainers->Trainer->Person`.givenName"), "givenName"],
        [literal("`Trainers->Trainer->Person->Unit`.name"), "unit"]
      ],
      include: [
        {
          model: models.Trainer,
          attributes: [],
          include: [
            {
              model: models.Person,
              attributes: [],
              include: [{ model: models.Unit, attributes: [] }]
            }
          ]
        }
      ]
    },
    {
      model: models.TrainingTrainee,
      as: "Trainees",
      attributes: [
        "id",
        [literal("`Trainees->Trainee`.id"), "traineeId"],
        [literal("`Trainees`.status"), "status"],
        [literal("`Trainees->Trainee->Person`.id"), "personId"],
        [literal("`Trainees->Trainee->Person`.persNum"), "persNum"],
        [literal("`Trainees->Trainee->Person`.name"), "name"],
        [literal("`Trainees->Trainee->Person`.rank"), "rank"],
        [literal("`Trainees->Trainee->Person`.givenName"), "givenName"],
        [literal("`Trainees->Unit`.name"), "unit"],
        [literal("`Trainees->Unit`.id"), "unitId"]
      ],
      include: [
        {
          model: models.Trainee,
          attributes: [],
          include: [
            {
              model: models.Person,
              attributes: []
            }
          ]
        },
        { model: models.Unit, attributes: [] }
      ]
    },
    {
      model: models.TrainingTrainee,
      as: "Counts",
      required: false,
      separate: true,
      attributes: ["status", [fn("COUNT", col("TrainingTrainee.id")), "count"]],
      group: ["TrainingId", "status"]
    },
    { model: models.TrainingType, attributes: [] }
  ]
};

router.get("/", auth, async (req, res, next) => {
  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    var trainings = await models.Training.findAll(trainingData);
    res.status(200).send(errors.success(trainings));
  } catch (err) {
    next(err);
  }
});

router.get("/statistics/trainings/:type", auth, async (req, res, next) => {
  const { type } = req.params;

  if (req.level < 10) return next(new errors.UnauthorizedError());
  try {
    var statistics = await models.Training.findAll({
      attributes: [
        [fn("YEAR", col("startDate")), "year"],
        [fn("MONTH", col("startDate")), "month"],
        "status",
        [fn("COUNT", col("`TrainingType`.type")), "count"]
      ],
      include: [
        { model: models.TrainingTrainee, as: "Trainees", attributes: [] },
        { model: models.TrainingType, attributes: [], where: { type: type } }
      ],
      group: ["year", "month", "status"],
      raw: true
    });
    res.status(200).send(errors.success(statistics));
  } catch (err) {
    next(err);
  }
});

router.get("/statistics/units/:type", auth, async (req, res, next) => {
  const { type } = req.params;

  if (req.level < 10) return next(new errors.UnauthorizedError());
  try {
    var statistics = await models.Training.findAll({
      attributes: [
        [fn("YEAR", col("startDate")), "year"],
        [fn("MONTH", col("startDate")), "month"],
        [literal("`Trainees->Unit`.name"), "unit"],
        [literal("`Trainees`.status"), "status"],
        [fn("SUM", col("maxTrainees")), "maxTrainees"],
        [fn("COUNT", col("`TrainingType`.type")), "count"]
      ],
      where: { status: "finished" },
      include: [
        {
          model: models.TrainingTrainee,
          as: "Trainees",
          attributes: [],
          include: [{ model: models.Unit, attributes: [] }]
        },
        { model: models.TrainingType, attributes: [], where: { type: type } }
      ],
      group: ["year", "month", "unit", "status"],
      raw: true
    });
    res.status(200).send(errors.success(statistics));
  } catch (err) {
    next(err);
  }
});

router.get("/statusList", auth, (req, res, next) => {
  if (req.level < 10) return next(new errors.UnauthorizedError());
  res.status(200).send(errors.success(models.Training.statusList));
});

router.get("/reasonList", auth, (req, res, next) => {
  if (req.level < 10) return next(new errors.UnauthorizedError());
  res.status(200).send(errors.success(models.Training.reasonList));
});

router.get("/traineeStatusList", auth, (req, res, next) => {
  if (req.level < 10) return next(new errors.UnauthorizedError());
  res.status(200).send(errors.success(models.TrainingTrainee.statusList));
});

router.get("/trainerStatusList", auth, (req, res, next) => {
  if (req.level < 10) return next(new errors.UnauthorizedError());
  res.status(200).send(errors.success(models.TrainingTrainer.statusList));
});

router.get("/:trainingId", auth, async (req, res, next) => {
  const { trainingId } = req.params;
  try {
    if (req.level < 10) return next(new errors.UnauthorizedError());
    if (!trainingId) return next(new errors.MissingParameterError());

    var training = await models.Training.findByPk(trainingId, trainingData);
    if (!training) return next(new errors.ResourceNotFoundError("Training"));

    res.status(200).send(errors.success(training));
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  const { trainingType } = req.body;
  const keys = [
    "startDate",
    "endDate",
    "maxTrainees",
    "minTrainees",
    "status",
    "TrainingTypeId",
    "reason"
  ];

  try {
    var data = {};
    keys.forEach(key => {
      if (req.body[key]) data[key] = req.body[key];
    });
    if (data.status !== "cancelled") data.reason = null;

    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!data.startDate || !data.endDate || !trainingType)
      return next(new errors.MissingParameterError());

    var TrainingType = await models.TrainingType.findOne({
      where: { type: trainingType }
    });

    if (!TrainingType)
      return next(new errors.ResourceNotFoundError("Training Type"));
    data.TrainingTypeId = TrainingType.id;

    var training = await models.Training.create(data);
    var training = await models.Training.findByPk(training.id, trainingData);

    res.status(200).send(errors.success(training));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  const { trainingType } = req.body;
  const { id } = req.params;
  const keys = [
    "startDate",
    "endDate",
    "maxTrainees",
    "minTrainees",
    "status",
    "TrainingTypeId",
    "reason"
  ];

  try {
    var data = {};
    keys.forEach(key => {
      if (req.body.data[key]) data[key] = req.body.data[key];
    });
    if (data.status !== "cancelled") data.reason = null;

    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (
      !id ||
      (!data.startDate &&
        !data.endDate &&
        !data.maxTrainees &&
        !data.minTrainees &&
        !data.status &&
        !trainingType)
    )
      return next(new errors.MissingParameterError());
    if (trainingType) {
      var TrainingType = await models.TrainingType.findOne({
        where: { type: trainingType }
      });

      if (!TrainingType)
        return next(new errors.ResourceNotFoundError("Training Type"));
      data.TrainingTypeId = TrainingType.id;
    }
    var training = await models.Training.findByPk(id);

    if (!training) return next(new errors.ResourceNotFoundError("Training"));
    keys.forEach(key => {
      if (data[key]) training[key] = data[key];
    });
    training.reason = data.reason;
    await training.save();

    training = await models.Training.findByPk(id, trainingData);

    res.status(200).send(errors.success(training));
  } catch (err) {
    next(err);
  }
});

router.delete("/:trainingId", auth, async (req, res, next) => {
  const { trainingId } = req.params;

  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!trainingId) return next(new errors.MissingParameterError());
    var training = await models.Training.findByPk(trainingId);
    if (!training) return next(new errors.ResourceNotFoundError("Training"));
    await training.destroy();

    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

router.post("/:trainingId/trainer/:trainerId", auth, async (req, res, next) => {
  const { trainingId, trainerId } = req.params;

  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!trainingId || !trainerId)
      return next(new errors.MissingParameterError());
    await models.TrainingTrainer.create({
      TrainingId: trainingId,
      TrainerId: trainerId
    });
    var training = await models.Training.findByPk(trainingId, trainingData);

    res.status(200).send(errors.success(training));
  } catch (err) {
    next(err);
  }
});

router.put("/trainer/:trainingTrainerId", auth, async (req, res, next) => {
  const { trainingTrainerId } = req.params;
  const { status } = req.body;

  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!trainingTrainerId) return next(new errors.MissingParameterError());

    var trainingTrainer = await models.TrainingTrainer.findByPk(
      trainingTrainerId,
      {
        include: [{ model: models.Training }]
      }
    );
    if (!trainingTrainer)
      return next(new errors.ResourceNotFoundError("Training-Trainer"));

    trainingTrainer.status = status;
    await trainingTrainer.save();

    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

router.delete("/trainer/:trainingTrainerId", auth, async (req, res, next) => {
  const { trainingTrainerId } = req.params;

  try {
    if (req.level < 50) return next(new errors.UnauthorizedError());
    if (!trainingTrainerId) return next(new errors.MissingParameterError());

    var trainingTrainer = await models.TrainingTrainer.findByPk(
      trainingTrainerId
    );
    if (!trainingTrainer)
      return next(new errors.ResourceNotFoundError("Training-Trainer"));
    await trainingTrainer.destroy();

    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

router.post("/:trainingId/trainee/:traineeId", auth, async (req, res, next) => {
  const { trainingId, traineeId } = req.params;

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!trainingId || !traineeId)
      return next(new errors.MissingParameterError());

    var training = await models.Training.findByPk(trainingId);
    if (!training) return next(new errors.ResourceNotFoundError("Training"));
    if (training.status !== "open")
      return next(new errors.TrainingNotOpenError());

    var trainee = await models.Trainee.findByPk(traineeId, {
      include: [{ model: models.Person }]
    });
    if (trainee.Person.UnitId != req.unitId && req.level < 60)
      return next(new errors.UnauthorizedError());

    await models.TrainingTrainee.create({
      TrainingId: trainingId,
      TraineeId: traineeId,
      UnitId: req.unitId
    });

    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

router.put("/trainee/:trainingTraineeId", auth, async (req, res, next) => {
  const { trainingTraineeId } = req.params;
  const { status } = req.body;

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!trainingTraineeId || !status)
      return next(new errors.MissingParameterError());

    var trainingTrainee = await models.TrainingTrainee.findByPk(
      trainingTraineeId,
      {
        include: [{ model: models.Training }]
      }
    );
    if (!trainingTrainee)
      return next(new errors.ResourceNotFoundError("Training-Trainee"));
    if (trainingTrainee.UnitId !== req.unitId && req.level < 60)
      return next(new errors.UnauthorizedError());

    if (status === "set") {
      var training = await models.Training.findByPk(
        trainingTrainee.TrainingId,
        trainingData
      );
      var counts = training.Counts.find(c => c.status === "set");
      if (counts && counts.dataValues.count >= training.maxTrainees)
        return next(new errors.MaximumTraineesError());
    }

    trainingTrainee.status = status;
    await trainingTrainee.save();

    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

router.delete("/trainee/:trainingTraineeId", auth, async (req, res, next) => {
  const { trainingTraineeId } = req.params;

  try {
    if (req.level < 30) return next(new errors.UnauthorizedError());
    if (!trainingTraineeId) return next(new errors.MissingParameterError());

    var trainingTrainee = await models.TrainingTrainee.findByPk(
      trainingTraineeId
    );

    if (!trainingTrainee)
      return next(new errors.ResourceNotFoundError("Training-Trainee"));
    if (trainingTrainee.UnitId !== req.unitId && req.level < 60)
      return next(new errors.UnauthorizedError());

    trainingTrainee.destroy();
    res.status(200).send(errors.success());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
