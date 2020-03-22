module.exports = (sequelize, type) => {
  var Trainee = sequelize.define("Trainee", {
    PersonId: {
      type: type.INTEGER,
      allowNull: true,
      unique: true
    }
  });

  Trainee.associate = models => {
    models.Trainee.belongsTo(models.Person);
  };

  return Trainee;
};
