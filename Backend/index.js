const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./Middleware/connectToDatabase");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  //   "https://click2-hire-remote-job-platform.vercel.app",
  //   "https://click2-hire-remote-job-platform-click2hires-projects.vercel.app",
  //   "https://click2-hire-remote-job-platform-git-main-click2hires-projects.vercel.app",
  //   "https://click2-hire-remote-job-platform-r0iq7z4zu-click2hires-projects.vercel.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 CORS Origin Check:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ CORS Rejected:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.get("/health", (req, res) => res.status(200).send("ok"));
app.head("/health", (req, res) => res.status(200).send("ok"));

app.get("/", (req, res) => {
  res.json("Welcome to TripUp Backend Development!");
});

// for Authentication
app.use("/api/authentication", require("./route/AuthenticationRoute/index"));

// for Bill CRUD
app.use("/api/bill", require("./route/BillRoutes/index"));
// Server Listening
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT} ⛳`);
});
