const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const userRoute = require("./routes/users");
const courseRoute = require("./routes/courses");
app.get("/test", (req, res) => {
  res.json({ Message: "Hello World" });
});

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/user", userRoute);
app.use("/courses", courseRoute);

// DB connection

try {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log("DB connected Successfully");
  });
} catch (error) {
  console.error(error);
}

// Server initialization
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
