const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");
const Avatar = require("avatar-builder");
const imagemin = require("imagemin");
const fs = require("fs").promises;
const { existsSync } = require("fs");
const path = require("path");

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
    const avatarName = `${Date.now()}.png`;
    try {
      const { body } = req;
      const avatar = Avatar.catBuilder(128);
      avatar.create(body.email).then((buffer) => fs.writeFile(`tmp/avatar.png`, buffer));
      await imagemin(["tmp/"], {
        destination: "public/images/",
      });
      fs.rename("public/images/avatar.png", `public/images/${avatarName}`);
      const hashedPassword = await bcrypt.hash(body.password, 2);
      const newUser = await User.create({
        ...body,
        password: hashedPassword,
        avatarURL: `http://localhost:3000/images/${avatarName}`,
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
    await User.findByIdAndUpdate(userId, { token: "" });
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
  updateUserValidator(req, res, next) {
    const validationRules = Joi.object({
      subscription: Joi.string().valid("free", "pro", "premium"),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
      password: Joi.string(),
    });
    const validationResult = validationRules.validate(req.body);
    if (validationResult.error) {
      return res.status(400).send({ message: "missing required name field" });
    }
    next();
  }
  async updateUserFields(req, res) {
    const url = req.user.avatarURL.replace("http://localhost:3000/images/", "");

    if (req.body.password && req.file) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      if (existsSync(`public/images/${url}`)) {
        fs.unlink(path.join("public/images", url));
      }
      const updatedPasswordFile = await User.findByIdAndUpdate(
        req.user._id,
        { ...req.body, password: hashedPassword, avatarURL: `http://localhost:3000/images/${req.file.filename}` },
        { new: true }
      );
      return res.status(200).json({ avatarURL: `http://localhost:3000/images/${req.file.filename}` });
    }
    if (req.body.password) {
      const hashedPasswor = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(req.user._id, { ...req.body, password: hashedPasswor }, { new: true });
      return res.status(200).send("Data updated");
    }
    if (req.file) {
      if (existsSync(`public/images/${url}`)) {
        fs.unlink(path.join("public/images", url));
      }
      await User.findByIdAndUpdate(
        req.user._id,
        { ...req.body, avatarURL: `http://localhost:3000/images/${req.file.filename}` },
        { new: true }
      );
      return res.status(200).json({ avatarURL: `http://localhost:3000/images/${req.file.filename}` });
    }
    await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    return res.status(200).send("Data updated");
  }
}
module.exports = new UserController();
