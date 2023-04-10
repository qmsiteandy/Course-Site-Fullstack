const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  studentId: { type: Number, required: true },
  courseId_array: Array,
});

module.exports = mongoose.model("Cart", cartSchema);
