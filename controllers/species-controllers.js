const mongoose = require("mongoose");
const HttpError = require("../middleware/http-error");
const SpeciesModel = require("../models/species-model");
const UserModel = require("../models/user-model");
const fs = require("fs");

const getAllSpecies = async (req, res, next) => {
  let species;
  try {
    species = await SpeciesModel.find({});
  } catch (err) {
    const error = new HttpError("Could not find any species", 404);
    return next(error);
  }
  res.status(201).json({ species });
};

const getSpeciesById = async (req, res, next) => {
  const { speciesId } = req.params;
  let species;
  try {
    species = await SpeciesModel.findById(speciesId);
  } catch (err) {
    const error = new HttpError(
      "Could not find any species with that id.",
      404
    );
    return next(error);
  }

  res.status(201).json({ species });
};

const editSpeciesById = async (req, res, next) => {
  const {
    speciesId,
    commonName,
    scientificName,
    description,
    dateFound,
    lat,
    lng,
    taxa,
  } = req.body;

  const updatedSpecies = {
    commonName,
    scientificName,
    description,
    coordinates: {
      lat: lat,
      lng: lng,
    },
    dateFound,
    taxa,
  };

  let species;
  try {
    species = await SpeciesModel.findByIdAndUpdate(speciesId, updatedSpecies);
  } catch (err) {
    const error = new HttpError(
      "Could not update a species with that id.",
      404
    );
    return next(error);
  }
  res.status(200).json({ species: updatedSpecies });
};

const deleteSpeciesById = async (req, res, next) => {
  const speciesId = req.params.speciesId;

  let species;
  let user;

  try {
    species = await SpeciesModel.findById(speciesId).populate("creators");
    user = await UserModel.findById(species.creators[0]._id);
  } catch (err) {
    const error = new HttpError("Could not delete this species.", 500);
    return next(error);
  }

  if (!species) {
    const error = new HttpError("No species was found with this ID.", 404);
    return next(error);
  }
  const imgPath = species.imgs.keyImg.source;
  try {
    await UserModel.findByIdAndUpdate(user._id, {
      $pull: { species: species._id },
    });
    await species.remove();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong. Please try again.", 404);
    return next(error);
  }

  fs.unlink(imgPath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Species Deleted" });
};

const getSpeciesByUserId = async (req, res, next) => {
  const { userId } = req.params;
  console.log("hello");

  let userSpeciesList;
  try {
    userSpeciesList = await UserModel.find({ userId });
    console.log(userSpeciesList);
  } catch (err) {
    const error = new HttpError(
      "There was a problem fetching species for this user.  Please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({ userSpeciesList });
};

const addSpecies = async (req, res, next) => {
  const {
    creators,
    commonName,
    scientificName,
    description,
    dateFound,
    lat,
    lng,
    taxa,
  } = req.body;

  const updatedTaxa = taxa.split(",");

  const createdSpecies = new SpeciesModel({
    commonName,
    scientificName,
    description,
    coordinates: {
      lat: lat,
      lng: lng,
    },
    dateFound,
    imgs: {
      keyImg: {
        source: req.file.key,
      },
    },
    taxa: updatedTaxa,
    creators,
  });

  let user;
  try {
    user = await UserModel.findById(creators);
  } catch (err) {
    const error = new HttpError("Could not add species to a user.", 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "A user could not be found for this species.",
      404
    );
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdSpecies.save({ session: sess });
    user.species.push(createdSpecies);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(err, 500);
    return next(error);
  }

  res.status(201).json({ species: createdSpecies });
};

exports.getAllSpecies = getAllSpecies;
exports.getSpeciesById = getSpeciesById;
exports.getSpeciesByUserId = getSpeciesByUserId;
exports.addSpecies = addSpecies;
exports.editSpeciesById = editSpeciesById;
exports.deleteSpeciesById = deleteSpeciesById;
