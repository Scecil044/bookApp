const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const colors = require("colors");
const schema = require("./schema/schema");
const { graphqlHTTP } = require("express-graphql");
const connectDb = require("./config/DB");

connectDb();
const app = express();

app.use(cors());
// app.use(helmet());

const port = process.env.PORT || 5500;

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === "development",
  })
);

// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal server error";

//   res.status(statusCode).json({
//     success: false,
//     statusCode,
//     message,
//   });
// });

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
