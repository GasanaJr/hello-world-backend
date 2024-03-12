const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructors",
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Courses", CourseSchema);
