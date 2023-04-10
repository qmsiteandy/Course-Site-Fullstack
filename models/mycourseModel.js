const mongoose = require(mongoose);

const mycourseSchema = new mongoose.Schema({
  studentId: { type: Number },
  courseId_array: { type: Array },
});

module.exports = mongoose.model("Mycourse", mycourseSchema);
