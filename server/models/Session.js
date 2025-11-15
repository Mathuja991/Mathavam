const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    childNo: { type: String, required: true },
    childName: { type: String, required: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    service: { type: String, required: true },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "completed" },
    endedBy: { type: String, default: null }, 
  },
  { timestamps: true }
);


SessionSchema.index({ startedAt: 1 });
SessionSchema.index({ staffId: 1, startedAt: -1 });
SessionSchema.index({ service: 1, startedAt: -1 });
SessionSchema.index({ childNo: 1, startedAt: -1 });


module.exports = mongoose.model("Session", SessionSchema);
