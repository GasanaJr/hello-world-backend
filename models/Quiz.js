const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  questions: [
    {
      questionText: String,
      options: [String],
      correctOption: Number,
    },
  ],
  maxScore: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Quizzes", quizSchema);
