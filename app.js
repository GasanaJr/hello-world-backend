const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.get("/test", (req, res) => {
  res.json({ Message: "Hello World" });
});

try {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log("DB connected Successfully");
  });
} catch (error) {
  console.error(error);
}
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
