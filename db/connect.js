const mongoose = require("mongoose");

const connectDB = async (url) => {
  if (!url) {
    throw new Error("Mongo connection URL is required (MONGO_URI)");
  }
  // Using minimal, supported options. Mongoose >=5.13 works with these.
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;
