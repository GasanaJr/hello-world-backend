const router = require("express").Router();
const Quizzes = require("../models/Quiz");
const UserProgress = require("../models/UserProgress");
const User = require("../models/User");

router.post("/quizzes", async (req, res) => {
  const { courseId, questions } = req.body;

  const quiz = new Quizzes({
    courseId,
    questions,
  });

  try {
    await quiz.save();
    res.status(201).json({ Message: "Quiz Created Successfully", Quiz: quiz });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
});

router.post("/submit-quiz", async (req, res) => {
  const { userId, quizId, answers } = req.body;

  try {
    const quiz = await Quizzes.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Evaluate answers
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOption) {
        score += 1; // Assuming each question is worth 1 point
      }
    });

    // Update or create user progress
    const progressUpdate = await UserProgress.findOneAndUpdate(
      { userId, courseId: quiz.courseId },
      {
        $push: { quizzesTaken: { quizId, score, attemptDate: new Date() } },
      },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ message: "Quiz submitted successfully", score, progressUpdate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress
router.get("/progress/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const progress = await UserProgress.find({ userId })
      .populate("courseId")
      .populate("quizzesTaken.quizId");
    if (!progress) {
      return res
        .status(404)
        .json({ message: "No progress found for this user" });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
