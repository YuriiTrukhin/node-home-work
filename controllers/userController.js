const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");

dotenv.config();
mongoose.set("useFindAndModify", false);

class UserController {
  validateUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string().required(),
    });
    const result = validationRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error.message);
    }
    next();
  }
  async newUser(req, res) {
    try {
      const { body } = req;
      const hashedPassword = await bcrypt.hash(body.password, 2);
      const newUser = await User.create({
        ...body,
        password: hashedPassword,
      });
      const { email, subscription } = newUser;
      res.status(201).json({
        user: {
          email: email,
          subscription: subscription,
        },
      });
    } catch (error) {
      res.status(409).send("Email in use");
    }
  }
  async login(req, res) {
    const {
      body: { email, password },
    } = req;
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(401).send("Email or password is wrong");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Email or password is wrong");
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET
    );
    await User.findByIdAndUpdate(user._id, { token: token });
    return res.status(200).json({
      token: token,
      user: {
        email: email,
        subscription: user.subscription,
      },
    });
  }
  async logout(req, res) {
    const {
      params: { userId },
    } = req;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send("Not authorized");
    }
    await User.findOneAndUpdate(userId, { token: "" });
    return res.status(204).send("No Content");
  }
  async currentUser(req, res) {
    const { email, subscription } = req.user;
    return res.status(200).json({ email: email, subscription: subscription });
  }
  async subUpdate(req, res) {
    const {
      params: { userId },
    } = req;
    const { subscription } = req.body;
    console.log(subscription);
    if (subscription === "free" || subscription === "pro" || subscription === "premium") {
      console.log(1);
      const newSub = await User.findByIdAndUpdate(userId, { subscription: subscription }, { new: true });
      return res.status(201).json({ email: newSub.email, subscription: newSub.subscription });
    }
    return res.status(401).send({ message: "subscription must be free, or pro, or premium" });
  }
}
module.exports = new UserController();
