const Session = require("../models/Session");

exports.createSession = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.childNo || !body.childName || !body.staffId || !body.staffName || !body.service || !body.startedAt || !body.endedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (body.durationSeconds == null) {
      const start = new Date(body.startedAt);
      const end = new Date(body.endedAt);
      body.durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
    }

    const s = await Session.create({
      childNo: String(body.childNo),
      childName: String(body.childName),
      staffId: String(body.staffId),
      staffName: String(body.staffName),
      service: String(body.service),
      startedAt: new Date(body.startedAt),
      endedAt: new Date(body.endedAt),
      durationSeconds: Number(body.durationSeconds),
      notes: body.notes ? String(body.notes) : "",
    });

    res.status(201).json(s);
  } catch (err) {
    console.error("Error saving session:", err.message);
    res.status(500).json({ error: "Failed to save session log", details: err.message });
  }
};

exports.getTodaySessions = async (req, res) => {
  try {
    const staffId = req.query.staffId || null;
    const dateQ = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(dateQ.getFullYear(), dateQ.getMonth(), dateQ.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const q = { startedAt: { $gte: start, $lt: end } };
    if (staffId) q.staffId = staffId;

    const sessions = await Session.find(q).sort({ startedAt: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    console.error("Fetch sessions error:", err.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const s = await Session.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ error: "Session not found" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

exports.listSessions = async (req, res) => {
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

    const start = from ? new Date(from) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);

    const filter = { startedAt: { $gte: start, $lte: end } };
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
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// NEW: KPI summary for cards
exports.summaryStats = async (req, res) => {
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
  } catch {
    res.status(500).json({ error: "Failed to compute summary" });
  }
};

// (Optional) CSV export of current filter
exports.exportCsv = async (req, res) => {
  try {
    // reuse list filter building
    req.query.pageSize = 100000; // big cap
    const { items } = await (async () => {
      const fakeRes = { json: (v) => v };
      return await exports.listSessions({ ...req }, fakeRes);
    })();
  } catch {
    // fallback: rebuild filter quickly (to keep this concise)
  }
  // Simple rebuild (safe fallback)
  const {
    from,
    to,
    staffId,
    service,
    status,
    q,
    sort = "-startedAt",
  } = req.query;

  const start = from ? new Date(from) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  const filter = { startedAt: { $gte: start, $lte: end } };
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

  const sortObj = sort.split(",").reduce((acc, s) => {
    const dir = s.startsWith("-") ? -1 : 1;
    const key = s.replace(/^[-+]/, "");
    acc[key] = dir;
    return acc;
  }, {});

  const rows = await Session.find(filter).sort(sortObj).lean();

  const header = [
    "startedAt",
    "endedAt",
    "durationSeconds",
    "childNo",
    "childName",
    "staffId",
    "staffName",
    "service",
    "status",
    "notes",
  ];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [
        new Date(r.startedAt).toISOString(),
        new Date(r.endedAt).toISOString(),
        r.durationSeconds,
        `"${r.childNo}"`,
        `"${r.childName?.replace(/"/g, '""') || ""}"`,
        `"${r.staffId}"`,
        `"${r.staffName?.replace(/"/g, '""') || ""}"`,
        `"${r.service}"`,
        `"${r.status || "completed"}"`,
        `"${(r.notes || "").replace(/"/g, '""')}"`,
      ].join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sessions.csv");
  return res.send(csv);
};
