const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JobListing = require("../models/Jobs");
const Instructor = require("../models/Instructor");
const nodemailer = require("nodemailer");
require("dotenv").config();
const {
  loginValidation,
  registerValidation,
} = require("../helpers/validation");
const Course = require("../models/Course");

// Create a user
router.post("/register", async (req, res) => {
  // Data validation
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ Message: error.details[0].message });

  // Checking if email exists in both User and Instructor collections to prevent duplicate registrations
  const emailExistsInUsers = await User.findOne({ email: req.body.email });
  const emailExistsInInstructors = await Instructor.findOne({
    email: req.body.email,
  });
  if (emailExistsInUsers || emailExistsInInstructors) {
    return res
      .status(400)
      .json({ Message: "Email already exists in our records." });
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    if (req.body.role === "instructor") {
      // Assuming Instructor model is similar to User but might have additional fields
      const instructor = new Instructor({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isApproved: false,
        qualifications: req.body.qualifications,
      });
      await instructor.save();
      res.status(201).json({
        Message: "Instructor registered successfully. Pending approval.",
      });
    } else {
      // Register as a regular user
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
      });
      await user.save();
      res.status(201).json({ Message: "User created successfully." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ Message: "An error occurred during the registration process." });
  }
});

// Loggin in a user
// router.post("/login", async (req, res) => {
//   // Data validation
//   const { error } = loginValidation(req.body);
//   if (error) return res.status(400).json(error.details[0].message);
//   const { email, password } = req.body;
//   const user = await User.findOne({ email: email });
//   if (!user) {
//     return res.status(400).json({ Message: "Email or Password Incorrect" });
//   }
//   const validPass = await bcrypt.compare(password, user.password);
//   if (!validPass) {
//     return res.status(400).json({ Message: "Email or Password Incorrect" });
//   }
//   const payload = {
//     user: {
//       id: user.id,
//       role: user.role,
//     },
//   };
//   jwt.sign(payload, process.env.TOKEN_SECRET, (err, token) => {
//     if (err) throw err;
//     res.status(200).json({ token: token, user: user });
//   });
// });
router.post("/login", async (req, res) => {
  // Data validation
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  const { email, password } = req.body;

  // Try to find the user in the User collection
  let user = await User.findOne({ email: email });

  // If not found in Users, try finding in Instructors
  if (!user) {
    user = await Instructor.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ Message: "Email or Password Incorrect" });
    } else if (!user.isApproved) {
      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        return res.status(400).json({ Message: "Email or Password Incorrect" });
      }
      return res.status(401).json({
        Message:
          "Instructor account not approved yet! Please contact your Admin.",
      });
    }
  }

  // If user or instructor is found, verify the password
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).json({ Message: "Email or Password Incorrect" });
  }

  // Construct payload based on whether the account is a User or Instructor
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  // Sign the JWT token and respond
  jwt.sign(payload, process.env.TOKEN_SECRET, (err, token) => {
    if (err) throw err;
    res.status(200).json({ token: token, user: user });
  });
});

// Update a user
router.put("/update/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Initialize a variable to hold the found document
    let person;

    // Check the role and update accordingly
    if (req.body.role === "instructor") {
      person = await Instructor.findById(userId);
      if (person) {
        // Update common fields
        person.name = req.body.name || person.name;
        person.email = req.body.email || person.email;
        // Specific to instructors
        person.qualifications = req.body.education || person.qualifications;
      }
    } else {
      // Assuming "user" role or any other role is treated as a user
      person = await User.findById(userId);
      if (person) {
        // Update common fields
        person.name = req.body.name || person.name;
        person.email = req.body.email || person.email;
        // Specific to users
        person.education = req.body.education || person.education;
        person.skills = req.body.skills || person.skills;
        person.interests = req.body.interests || person.interests;
      }
    }

    // Check if the document was found and updated
    if (person) {
      await person.save();
      res.status(200).json({
        message: "Profile updated successfully.",
        user: person,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred." });
  }
});

// Getting all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    const instructors = await Instructor.find();
    res.status(200).json({
      Message: "Users retrieved Successfully",
      Users: users,
      Instructors: instructors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Message: "Server Error" });
  }
});

// ----------------------- Admins Section --------------------------
// Endpoint to approve an instructor
router.post("/instructors/approve/:instructorId", async (req, res) => {
  const { instructorId } = req.params;

  try {
    const instructor = await Instructor.findById(instructorId);

    if (!instructor) {
      return res.status(404).send("Instructor not found.");
    }

    if (instructor.isApproved == true) {
      instructor.isApproved = false;
      await instructor.save();
      res.status(200).json({
        message: "Instructor Deactivated successfully.",
        instructor: instructor,
      });
    } else {
      instructor.isApproved = true;
      await instructor.save();
      res.status(200).json({
        message: "Instructor Activated successfully.",
        instructor: instructor,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred.");
  }
});

router.get("/instructors", async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json({ Message: instructors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Message: "Server Error" });
  }
});

router.post("/job-listings", async (req, res) => {
  const { title, description, requiredSkills, link } = req.body;

  try {
    // Select Ids of the courses
    const relevantCourses = await Course.find({
      category: { $in: requiredSkills },
    }).select("_id");

    const relevantCoursesId = relevantCourses.map((course) => course._id);

    // Find matching users
    const matchingUsers = await User.find({
      skills: { $in: requiredSkills },
      courses: { $in: relevantCoursesId },
    });
    const matchingUsersNames = matchingUsers.map((user) => user.name);

    // Send emails to matching users (pseudo-code)
    // matchingUsers.forEach((user) => {
    //   sendEmailToUser(user, newJob);
    // });
    const newJob = new JobListing({
      title,
      description,
      requiredSkills,
      link,
      matchingUsers: matchingUsersNames,
    });
    await newJob.save();

    res.status(201).json({
      message: "Job posted successfully and emails sent to matching users.",
      matchingUsers: matchingUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  async function sendEmailToUser(user, job) {
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: `New job listing that matches your skills: ${job.title}`,
      html: `
      Hi ${user.name},<br>We've found a new job listing that matches your skills. <br>
      <b>Title</b>: ${job.title}. <br>
      <b>Description</b>: ${job.description} <br> Apply via <a href="${job.link}">here</a> <br><br>Best,<br>Didas Junior.
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
  }
});

router.get("/job-listings", async (req, res) => {
  try {
    const jobListings = await JobListing.find();
    res.status(200).json({ Message: jobListings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Message: "Server Error" });
  }
});

// -------------------Instructors Endpoints ------------------------

module.exports = router;
