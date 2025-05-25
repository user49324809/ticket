const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("NEW", "IN_PROGRESS", "COMPLETED", "CANCELED"),
    defaultValue: "NEW",
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: "tickets"
});

module.exports = Ticket;
