const mongoose = require(mongoose);

const mycourseSchema = new mongoose.Schema({
  userId: { type: Number },
  courseIdList: { type: Array },
});

module.exports = mongoose.model("Mycourse", mycourseSchema);
