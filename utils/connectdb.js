//setting up mongoDB and mongoose
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.97alc.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`
    );

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
      console.log("Database connected");
    });
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
}

connectDB();
