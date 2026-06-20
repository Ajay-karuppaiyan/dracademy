const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    certificateDate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
