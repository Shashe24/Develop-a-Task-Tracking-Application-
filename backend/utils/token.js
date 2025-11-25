const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, JWT_SECRET } = process.env;

const createAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET || JWT_SECRET);
}

module.exports = {
  createAccessToken,
}