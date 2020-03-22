module.exports = (sequelize, type) => {
  var Trainer = sequelize.define("Trainer", {
    trainer: {
      type: type.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    examiner: {
      type: type.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    PersonId: {
      type: type.INTEGER,
      allowNull: true,
      unique: true
    }
  });

  Trainer.associate = models => {
    models.Trainer.belongsTo(models.Person);
  };

  return Trainer;
};
