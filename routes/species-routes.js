const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const fileUpload = require("../middleware/file-upload");

const speciesControllers = require("../controllers/species-controllers");

router.get("/", speciesControllers.getAllSpecies);

router.get("/:speciesId", speciesControllers.getSpeciesById);

router.get("/user/:userId", speciesControllers.getSpeciesByUserId);

router.use(checkAuth);

router.post("/", fileUpload.single("image"), speciesControllers.addSpecies);
router.post("/", fileUpload(req.body.image), speciesControllers.addSpecies);

router.patch("/:speciesId", speciesControllers.editSpeciesById);

router.delete("/:speciesId", speciesControllers.deleteSpeciesById);

module.exports = router;
