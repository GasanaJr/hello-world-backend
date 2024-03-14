const mongoose = require("mongoose");
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customers",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  quizzesTaken: [
    {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quizzes",
      },
      score: Number,
      attemptDate: Date,
    },
  ],
});

module.exports = mongoose.model("Progress", userProgressSchema);
