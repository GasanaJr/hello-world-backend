const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Create a user
router.post("/register", async (req, res) => {
  // Checking if email exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).json({ Message: "Email Already Exists!" });
  }
  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });
  try {
    await user.save();
    res.status(201).json({ Message: "User created Successfully" });
  } catch (error) {
    console.log(error);
  }
});

// Loggin in a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ Message: "Email not Found" });
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).json({ Message: "Incorrect Password" });
  }
  res.status(200).json({ Message: "Login Successful" });
});

module.exports = router;
