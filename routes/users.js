const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create a user
router.post("/register", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });
  try {
    console.log(user);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
