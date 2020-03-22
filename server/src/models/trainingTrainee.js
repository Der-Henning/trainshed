module.exports = (sequelize, type) => {
  const status = ["queued", "set", "dismissed"];

  var TrainingTrainee = sequelize.define(
    "TrainingTrainee",
    {
      status: {
        type: type.STRING,
        defaultValue: "queued",
        allowNull: false,
        validate: {
          isIn: [status],
          notEmpty: true
        }
      }
    },
    {
      indexes: [{ unique: true, fields: ["UnitId", "TrainingId", "TraineeId"] }]
    }
  );

  TrainingTrainee.statusList = status;

  TrainingTrainee.associate = models => {
    models.TrainingTrainee.belongsTo(models.Unit, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
    models.TrainingTrainee.belongsTo(models.Trainee, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
    models.TrainingTrainee.belongsTo(models.Training, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
  };

  return TrainingTrainee;
};
