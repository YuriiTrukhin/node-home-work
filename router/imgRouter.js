const { Router } = require("express");
const path = require('path')
const express = require('express');
const {authorization} =require("../auth/authController")
const router = Router();
const multer = require("multer");
const UserController = require("../controllers/userController");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.use('/images',express.static(path.join("public/images")))
router.patch("/users/avatars", authorization, upload.single("avatar"),UserController.updateUserValidator, UserController.updateUserFields);

module.exports = router;