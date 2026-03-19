const mongoose = require("mongoose");

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Center", centerSchema);