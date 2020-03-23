module.exports = (sequelize, type) => {
  const status = [null, "trainer", "examiner", "supervision"];

  var TrainingTrainer = sequelize.define("TrainingTrainer", {
    status: {
      type: type.STRING,
      allowNull: true,
      validate: {
        isIn: [status]
      }
    }
  },
  {
    indexes: [{ unique: true, fields: ["TrainingId", "TrainerId"] }]
  });

  TrainingTrainer.statusList = status;

  TrainingTrainer.associate = models => {
    models.TrainingTrainer.belongsTo(models.Trainer, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
    models.TrainingTrainer.belongsTo(models.Training, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
  };

  return TrainingTrainer;
};
