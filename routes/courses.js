const Courses = require("../models/Course");
const router = require("express").Router();

router.post("/add-course", async (req, res) => {
  const { title, instructor, link, description } = req.body;
  // Save course instance
  const course = new Courses({
    title: title,
    instructor: instructor,
    link: link,
    description: description,
  });

  // save the course
  try {
    await course.save();
    res.status(201).json({ Message: "Course saved successfully" });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
});

router.get("/get-courses", async (req, res) => {
  try {
    const courses = await Courses.find();
    res.status(200).json({ Message: courses });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
});

