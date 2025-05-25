const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ticketdb", "username", "password", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
