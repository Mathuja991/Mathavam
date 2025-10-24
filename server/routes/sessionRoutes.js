const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// Listing and stats first to avoid conflicts with "/:id"
router.get("/", sessionController.listSessions); // list with filters & pagination
router.get("/stats/summary", sessionController.summaryStats);
router.get("/export.csv", sessionController.exportCsv);

// Staff flow
router.post("/", sessionController.createSession);
router.get("/today", sessionController.getTodaySessions);

// Must be last: by-id route
router.get("/:id", sessionController.getSessionById);

module.exports = router;
