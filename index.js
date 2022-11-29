const express = require("express");
const HttpError = require("./middleware/http-error");
const fs = require("fs");
const path = require("path");

//access to env file when in development mode only
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//connecing Mongodb
require("./utils/connectdb");

//setting up routes
const speciesRoutes = require("./routes/species-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(express.json({ extended: true }));

//setting header to avoid CORS restrictions
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  next();
});

app.use("/api/species", speciesRoutes);
app.use("/api/users", usersRoutes);

app.all("*", (req, res, next) => {
  return next(new HttpError("Page Not Found", 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

app.listen(process.env.PORT || 8080);
