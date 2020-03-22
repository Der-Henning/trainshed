const jwt = require("jsonwebtoken");
const config = require("../config");
const errors = require("./errors");

module.exports = (req, res, next) => {
  //get the token from the header if present
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  if (!token) throw new errors.AuthenticationError();

  try {
    //if can verify the token, set req.userId and pass to next middleware
    const decoded = jwt.verify(token, config.myprivatekey);
    req.userId = decoded.userId;
    req.level = decoded.level;
    req.unitId = decoded.unitId;
    next();
  } catch (ex) {
    //if invalid token
    throw new errors.AuthenticationError();
  }
};
