const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

// --- GET /api/admin/sessions (filtered list + pagination)
router.get("/sessions", async (req, res) => {
  try {
    const {
      from,
      to,
      staffId,
      service,
      status,
      q,
      page = 1,
      pageSize = 20,
      sort = "-startedAt",
    } = req.query;

    const filter = {};
    // Date range
    const start = from ? new Date(from) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    filter.startedAt = { $gte: start, $lte: end };

    if (staffId) filter.staffId = staffId;
    if (service) filter.service = service;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { childNo: new RegExp(q, "i") },
        { childName: new RegExp(q, "i") },
        { staffName: new RegExp(q, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const sortObj = sort.split(",").reduce((acc, s) => {
      const dir = s.startsWith("-") ? -1 : 1;
      const key = s.replace(/^[-+]/, "");
      acc[key] = dir;
      return acc;
    }, {});

    const [items, total] = await Promise.all([
      Session.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Session.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (e) {
    console.error("Admin session fetch error:", e);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// --- GET /api/admin/sessions/stats/summary (KPI summary)
router.get("/sessions/stats/summary", async (req, res) => {
  try {
    const { from, to, service, staffId } = req.query;
    const start = from ? new Date(from) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);

    const match = { startedAt: { $gte: start, $lte: end } };
    if (service) match.service = service;
    if (staffId) match.staffId = staffId;

    const [agg] = await Session.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalDuration: { $sum: "$durationSeconds" },
          uniqueChildren: { $addToSet: "$childNo" },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          avgDurationSeconds: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $divide: ["$totalDuration", "$total"] },
            ],
          },
          uniqueChildrenCount: { $size: "$uniqueChildren" },
        },
      },
    ]);

    res.json(
      agg || { total: 0, avgDurationSeconds: 0, uniqueChildrenCount: 0 }
    );
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ error: "Failed to calculate summary" });
  }
});

module.exports = router;
