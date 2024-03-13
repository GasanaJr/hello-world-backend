const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Instructor = require("../models/Instructor");
const {
  loginValidation,
  registerValidation,
} = require("../helpers/validation");

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

// ----------------------- Admins Section --------------------------
// Endpoint to approve an instructor
router.post("/instructors/approve/:instructorId", async (req, res) => {
  const { instructorId } = req.params;

  try {
    const instructor = await Instructor.findById(instructorId);

    if (!instructor) {
      return res.status(404).send("Instructor not found.");
    }

    instructor.isApproved = true;
    await instructor.save();

    res.status(200).json({
      message: "Instructor approved successfully.",
      instructor: instructor,
    });
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

// -------------------Instructors Endpoints ------------------------

module.exports = router;
