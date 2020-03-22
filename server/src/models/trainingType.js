module.exports = (sequelize, type) => {
    var TrainingType = sequelize.define("TrainingType", {
      type: {
          type: type.STRING,
          allowNull: false,
          unique: true
      }
    });
    return TrainingType;
  };
  