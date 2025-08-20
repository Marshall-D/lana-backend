require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");

// Security & basic middleware
app.use(helmet());
app.use(xss());
// dev: allows requests from your phone (you can tighten this in production)
app.use(cors());

const authRouter = require("./routes/auth");

// useful checks (don't log secrets themselves)
console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);
console.log("MONGO_URI present:", !!process.env.MONGO_URI);

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
// extra packages
const connectDB = require("./db/connect");

// routes
app.get("/", (req, res) => {
  res.send("jobs api");
});

app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    // required env checks
    if (!process.env.MONGO_URI) {
      console.error("Missing required env var: MONGO_URI");
      process.exit(1);
    }
    if (!process.env.JWT_SECRET) {
      console.warn("Warning: JWT_SECRET not set. Set this in production!");
    }

    await connectDB(process.env.MONGO_URI);

    const port = process.env.PORT || 3000;

    const server = app.listen(port, "0.0.0.0", () =>
      console.log(`Server is listening on http://0.0.0.0:${port}`)
    );

    // graceful shutdown on SIGTERM (Render sends SIGTERM on deploy)
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Closing server...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    // handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

module.exports = app; // exporting app can be useful for tests
