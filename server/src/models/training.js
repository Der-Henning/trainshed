module.exports = (sequelize, type) => {
  const status = ["open", "cancelled", "locked", "finished"];
  const reasons = ["infrastructure", "trainer", "trainee", "other"];

  var Training = sequelize.define("Training", {
    startDate: {
      type: type.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: type.DATEONLY,
      allowNull: false
    },
    maxTrainees: {
      type: type.INTEGER,
      defaultValue: 12,
      allowNull: false
    },
    minTrainees: {
      type: type.INTEGER,
      defaultValue: 6,
      allowNull: false
    },
    status: {
      type: type.STRING,
      defaultValue: "open",
      allowNull: false,
      validate: {
        isIn: [status],
        notEmpty: true
      }
    },
    reason: {
      type: type.STRING,
      allowNull: true,
      validate: {
        isIn: [reasons],
        notEmpty: true
      }
    }
  });

  Training.statusList = status;
  Training.reasonList = reasons;

  Training.associate = models => {
    models.Training.belongsTo(models.TrainingType, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });

    models.Training.belongsToMany(models.Trainer, {
      through: models.TrainingTrainer
    });
    models.Training.hasMany(models.TrainingTrainee, {
      foreignKey: { allowNull: false },
      onDelete: "CASCADE",
      as: "Trainees"
    });
    models.Training.hasMany(models.TrainingTrainee, {
      foreignKey: { allowNull: false },
      onDelete: "CASCADE",
      as: "Counts"
    });
  };

  return Training;
};
