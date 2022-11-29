const HttpError = require("../middleware/http-error");
const UserModel = require("../models/user-model");
const SpeciesModel = require("../models/species-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Registration Failed. Please try again.", 500));
  }

  if (existingUser) {
    return next(new HttpError("Email has already been registered.", 200));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("Could not create user.  Please try again.", 500)
    );
  }

  const newUser = new UserModel({
    firstName,
    lastName,
    email,
    admin: false,
    password: hashedPassword,
    profileImg: req.file.key || null,
    species: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError("Registration Failed. Please try again later.", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "2h",
      }
    );
  } catch (err) {
    return next(
      new HttpError("Registration Failed. Please try again later.", 500)
    );
  }

  res
    .status(201)
    .json({ userId: newUser._id, email: newUser.email, token: token });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Login Failed. Please try again.", 500));
  }

  if (!existingUser) {
    return next(
      new HttpError(
        "Email and/or password is incorrect. Please try again.",
        401
      )
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Could not log you in. Please try again.", 500));
  }

  if (!isValidPassword) {
    return next(
      new HttpError(
        "Email and/or password is incorrect. Please try again.",
        401
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(
      new HttpError("Registration Failed. Please try again later.", 500)
    );
  }

  res.status(201).json({
    userId: existingUser._id,
    email: existingUser.email,
    token: token,
  });
};

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({});
  } catch (err) {
    const error = next(new HttpError("Could not find any users", 404));
    return next(error);
  }
  res.status(201).json({ users });
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  let user;
  try {
    user = await UserModel.findById(userId);
  } catch (err) {
    const error = new HttpError("Can not find user by that id", 404);
    return next(error);
  }

  res.status(200).json({ user });
};

const deleteUserById = async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  let user;
  let species;
  try {
    species = await SpeciesModel.findOne({ creators: userId });

    user = await UserModel.findById(userId).populate("species");
  } catch (err) {
    const error = new HttpError("Can not find user by that id", 404);
    return next(error);
  }

  try {
    await species.remove();
    await user.remove();
  } catch (err) {
    const error = new HttpError("Can not delete that user.", 404);
    return next(error);
  }

  res.status(200).json({ user });
};

const updateUser = async (req, res, next) => {
  const { userId, firstName, lastName, email, speciesId } = req.body;

  const updatedUser = {
    firstName,
    lastName,
    email,
    speciesDocumented: [speciesId],
  };

  let user;
  try {
    user = await UserModel.findOneAndUpdate(userId, updatedUser);
  } catch (err) {
    const error = new HttpError("Could complete update at this time", 500);
    return next(error);
  }
  res.status(200).json(user);
};

exports.getUserById = getUserById;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getAllUsers = getAllUsers;
exports.deleteUserById = deleteUserById;
exports.updateUser = updateUser;
