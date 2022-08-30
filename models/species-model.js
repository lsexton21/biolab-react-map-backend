const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user-model");

const SpeciesSchema = new Schema({
  commonName: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  dateFound: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  imgs: {
    keyImg: {
      source: {
        type: String,
        required: false,
      },
      magnification: {
        type: Number,
        required: false,
      },
    },
    secondaryImg: {
      src: {
        type: String,
        required: false,
      },
      magnification: {
        type: Number,
        required: false,
      },
    },
  },
  creators: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  ],
  taxa: {
    type: Array,
    required: false,
  },
});

module.exports = mongoose.model("Species", SpeciesSchema);
