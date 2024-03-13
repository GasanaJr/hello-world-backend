const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: false,
    },
  ],
  isApproved: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Instructors", instructorSchema);
