require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const questionRoutes = require("./routes/questionRoutes");
const videoRoutes = require("./routes/videoRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ehs-suite.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Serves uploaded induction videos at /uploads/videos/<filename>.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));