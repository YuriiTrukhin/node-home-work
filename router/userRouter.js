const { Router } = require("express");
const logger = require("morgan");
const UserController = require("../controllers/userController");
const {authorization} =require("../auth/authController")

const router = Router();
router.use(logger("dev"));

router.post("/register", UserController.validateUser, UserController.newUser);
router.post("/login",UserController.validateUser, UserController.login);
router.get("/logout/:userId",authorization,UserController.logout);
router.get("/current",authorization,UserController.currentUser );
router.patch("/users/:userId",authorization,UserController.subUpdate );
router.get("/verify/:verificationToken",UserController.authEmail)

module.exports = router;