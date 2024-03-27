const Courses = require("../models/Course");
const Instructor = require("../models/Instructor");
const User = require("../models/User");
const router = require("express").Router();
const nodemailer = require("nodemailer");
require("dotenv").config();
// Route to add course by an instructor
router.post("/add", async (req, res) => {
  const { title, description, link, instructorEmail, category } = req.body;

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
      category
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
    res.status(500).json({ message: "Server error occurred." });
  }
});

// Get all courses

router.get("/get-courses", async (req, res) => {
  try {
    const courses = await Courses.find();
    const coursesWithInstructors = await Promise.all(
      courses.map(async (course) => {
        const instructor = await Instructor.findById(course.instructor);
        return {
          ...course.toObject(),
          instructorName: instructor ? instructor.name : "Instructor not Found",
        };
      })
    );
    res.status(200).json({
      Message: "Courses Fetched Successfully",
      courses: coursesWithInstructors,
    });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
});

// Register in a course

router.post("/enroll/:email/:courseId", async (req, res) => {
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
    //Nodemailer
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Enrollment Confirmation",
      html: `Thank you for enrolling in <b>${course.title}</b>. You can access the course via this link.
      <a href="${course.link}" target="_blank">${course.title}</a>
       `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).json(error);
      } else {
        console.log("email sent" + info);
        //res.status(200).json("success");
      }
    });

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

// Get user courses

router.get("/user-courses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const courses = user.courses;
    return res.status(200).json({ Courses: courses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ Message: "An error occured fetching user courses" });
  }
});

// Get a specific course

router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Courses.findById(courseId);
    return res.status(200).json({ course: course });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ Message: "An error occured fetching the course" });
  }
});

module.exports = router;
