const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Mongo connection running on ${conn.connection.host}`.rainbow.underline
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = connectDb;
