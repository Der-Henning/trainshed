const bcrypt = require("bcrypt");

module.exports = (sequelize, type) => {
  var User = sequelize.define("User", {
    username: {
      type: type.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: type.STRING,
      allowNull: false
    },
    mail: {
      type: type.STRING,
      allowNull: true,
      lowercase: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    level: {
      type: type.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      }
    }
  });

  User.associate = models => {
    models.User.belongsTo(models.Unit);
  };

  User.createAdmin = models => {
    models.User.findOne({ where: { username: "admin" } })
      .then(async admin => {
        if (!admin) {
          models.User.create({
            username: "admin",
            password: await bcrypt.hash("admin", 10),
            level: 99
          })
            .then(() => {
              console.log("admin user created!");
            })
            .catch(error => console.log(error));
        }
      })
      .catch(error => console.log(error));
  };

  return User;
};
