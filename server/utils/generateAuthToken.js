const jwt = require("jsonwebtoken");

const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.JWT_SECRET
  );
};

module.exports = generateAuthToken;
