module.exports = (sequelize, type) => {
  const status = ["trainer", "examiner", "supervision"];

  var TrainingTrainer = sequelize.define("TrainingTrainer", {
    status: {
      type: type.STRING,
      allowNull: true,
      validate: {
        isIn: [status],
        notEmpty: true
      }
    }
  });

  TrainingTrainer.status = status;

  return TrainingTrainer;
};
