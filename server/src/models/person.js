module.exports = (sequelize, type) => {
  var Person = sequelize.define(
    "Person",
    {
      persNum: {
        type: type.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          len: [8]
        }
      },
      name: {
        type: type.STRING,
        allowNull: false
      },
      givenName: {
        type: type.STRING,
        allowNull: false
      },
      rank: {
        type: type.STRING,
        allowNull: true
      },
      mail: {
        type: type.STRING,
        allowNull: true,
        lowercase: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      }
    },
    {
      indexes: [
        {
          unique: false,
          fields: ["name"]
        }
      ]
    }
  );

  Person.associate = models => {
    models.Person.belongsTo(models.Unit, {
      foreignKey: { allowNull: false },
      onDelete: "RESTRICT"
    });
    models.Person.hasOne(models.Trainer);
    models.Person.hasOne(models.Trainee);
  };

  return Person;
};
