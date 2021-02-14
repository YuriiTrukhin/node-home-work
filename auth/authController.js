const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const User = require("../models/User");

dotenv.config();

async function authorization(req, res, next) {
  const authorizationHeader = req.get('Authorization');
  if (!authorizationHeader) {
    return res.status(401).send({"message": "Not authorized"});
  }
  const token = authorizationHeader.replace('Bearer ','');
  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send({"message": "Not authorized"});
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send(error);
  }
}
module.exports={authorization}