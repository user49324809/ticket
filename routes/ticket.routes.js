const express = require("express");
const router = express.Router();
const controller = require("../controllers/ticket.controller");

router.post("/", controller.createTicket);
router.patch("/:id/start", controller.takeInWork);
router.patch("/:id/complete", controller.completeTicket);
router.patch("/:id/cancel", controller.cancelTicket);
router.get("/", controller.getTickets);
router.patch("/cancel-all-in-progress", controller.cancelAllInProgress);

module.exports = router;
