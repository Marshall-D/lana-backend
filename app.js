require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors()); // dev: allows requests from your phone

const authRouter = require("./routes/auth");
console.log("JWT_SECRET:", !!process.env.JWT_SECRET); // prints true/false
// console.log("JWT_SECRET:", process.env.JWT_SECRET);

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

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const port = process.env.PORT || 3000;
    app.listen(port, "0.0.0.0", () =>
      console.log(`Server is listening on http://0.0.0.0:${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
