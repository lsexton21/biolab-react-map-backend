const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const fileUpload = require("../middleware/file-upload");

const usersControllers = require("../controllers/users-controllers");

router.post(
  "/register",
  fileUpload.single("image"),
  usersControllers.registerUser
);

router.post("/login", usersControllers.loginUser);

router.get("/", usersControllers.getAllUsers);

router.use(checkAuth);

router.get("/:userId", usersControllers.getUserById);

router.patch("/:userId", usersControllers.updateUser);

router.delete("/:userId", usersControllers.deleteUserById);

module.exports = router;
