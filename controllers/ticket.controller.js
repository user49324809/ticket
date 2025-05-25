const Ticket = require("../models/ticket.model");
const { Op } = require("sequelize");

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "Тема и текст обязательны" });

    const ticket = await Ticket.create({ subject, message });
    res.status(201).json(ticket);
  } catch (e) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.takeInWork = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Обращение не найдено" });
    if (ticket.status !== "NEW") return res.status(400).json({ error: "Можно взять только новое обращение" });

    ticket.status = "IN_PROGRESS";
    await ticket.save();
    res.json(ticket);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.completeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Обращение не найдено" });
    if (ticket.status !== "IN_PROGRESS") return res.status(400).json({ error: "Можно завершить только обращение в работе" });

    const { solution } = req.body;
    if (!solution) return res.status(400).json({ error: "Текст решения обязателен" });

    ticket.status = "COMPLETED";
    ticket.solution = solution;
    await ticket.save();
    res.json(ticket);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Обращение не найдено" });
    if (["COMPLETED", "CANCELED"].includes(ticket.status)) {
      return res.status(400).json({ error: "Нельзя отменить завершенное или уже отмененное обращение" });
    }

    const { cancelReason } = req.body;
    if (!cancelReason) return res.status(400).json({ error: "Причина отмены обязательна" });

    ticket.status = "CANCELED";
    ticket.cancelReason = cancelReason;
    await ticket.save();
    res.json(ticket);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let where = {};

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23,59,59,999);
      where.createdAt = { [Op.between]: [dayStart, dayEnd] };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const tickets = await Ticket.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(tickets);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.cancelAllInProgress = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ where: { status: "IN_PROGRESS" } });
    for (const ticket of tickets) {
      ticket.status = "CANCELED";
      ticket.cancelReason = "Отменено массово";
      await ticket.save();
    }
    res.json({ canceledCount: tickets.length });
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
