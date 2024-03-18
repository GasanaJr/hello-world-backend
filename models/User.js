const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 255,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  education: {
    type: String,
    required: false,
  },
  skills: [
    {
      type: String,
      required: false,
    },
  ],
  role: {
    type: String,
    required: true,
  },
  interests: [
    {
      type: String,
      required: false,
    },
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: false,
    },
  ],
});
module.exports = Customers = mongoose.model("Customers", userSchema);
