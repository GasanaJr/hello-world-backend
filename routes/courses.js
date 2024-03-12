const Courses = require("../models/Course");
const Instructor = require("../models/Instructor");
const User = require("../models/User");
const router = require("express").Router();

// Route to add course by an instructor
router.post("/add", async (req, res) => {
  const { title, description, link, instructorEmail } = req.body;

  try {
    // Find the instructor by email
    const instructor = await Instructor.findOne({ email: instructorEmail });

    // Check if instructor exists
    if (!instructor) {
      return res.status(404).send("Instructor not found.");
    }

    // Check if the instructor is approved
    if (!instructor.isApproved) {
      return res
        .status(403)
        .send("Instructor has not been approved to add courses.");
    }

    // Create a new course with the instructor ID
    const course = new Courses({
      title,
      description,
      link,
      instructor: instructor._id, // Assign the instructor's ID to the course
    });

    // Save the new course
    await course.save();

    // Optionally, add the course ID to the instructor's courses list
    instructor.courses.push(course._id);
    await instructor.save();

    res.status(201).json({
      message: "Course added successfully",
      course: course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred.");
  }
});

// Get all courses

router.get("/get-courses", async (req, res) => {
  try {
    const courses = await Courses.find();
    res.status(200).json({ Message: courses });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
});

// Register in a course

router.post("/enroll", async (req, res) => {
  try {
    const { email, courseId } = req.params;
    const user = await User.findOne({ email: email });
    const course = await Courses.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ Message: "User or Course not found" });
    }

    // Check if a user is enrolled in a course
    if (user.courses.includes(course._id)) {
      return res
        .status(400)
        .json({ Message: "User is already enrolled in this course" });
    }

    // Add a course to the array of user
    user.courses.push(course._id);
    // save
    await user.save();

    // Send response
    res.status(200).json({
      Message: "User enrolled Successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Message: "Server Error" });
  }
});

module.exports = router;
