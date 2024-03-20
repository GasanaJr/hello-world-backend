const mongoose = require("mongoose");

const jobListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [
    {
      type: String,
      required: true,
    },
  ],
  link: {
    type: String,
    required: true,
  },
  matchingUsers: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("JobListing", jobListingSchema);
