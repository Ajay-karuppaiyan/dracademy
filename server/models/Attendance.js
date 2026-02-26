const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  date: { type: Date, default: Date.now },
  loginTime: { type: String, required: true },
  logoutTime: { type: String },
  photo: { type: String },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
