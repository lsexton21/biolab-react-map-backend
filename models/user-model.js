const mongoose = require("mongoose");
const { Schema } = mongoose;
const SpeciesModel = require("./species-model");

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: false,
  },
  profileImg: {
    type: String,
    required: false,
  },
  species: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Species",
    },
  ],
});

// UserSchema.post("findOneAndDelete", async (user) => {
//   if (user.species) {
//     await SpeciesModel.deleteMany({ creators: { $in: user._id } });
//   }
// });

module.exports = mongoose.model("User", UserSchema);
