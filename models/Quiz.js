const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Quizzes", quizSchema);
