module.exports = (sequelize, type) => {
  var Unit = sequelize.define("Unit", {
    name: {
      type: type.STRING,
      allowNull: false,
      unique: true
    }
  });

  return Unit;
};
