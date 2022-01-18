require("dotenv").config();
const path = require("path");
const cookieSession = require("cookie-session");
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const config = require("./config");
if (
  config.credentials.client_id == null ||
  config.credentials.client_secret == null
) {
  console.error(
    "Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables."
  );
  return;
}

let app = express();

const socketIO = require("./socket.io")(app);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "50mb" }));
app.use(multer().single("fileToUpload"));
app.use("/api/forge/oauth", require("./routes/oauth"));
app.use("/api/forge/oss", require("./routes/oss"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode).json(err);
});

app.use(
  cookieSession({
    name: "forge_session",
    keys: ["forge_secure_key"],
    maxAge: 60 * 60 * 1000, // 1 hour, same as the 2 legged lifespan token
  })
);
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use("/api", require("./web/router"));

app.set("port", PORT);

let server = socketIO.http.listen(app.get("port"), () => {
  console.log(`Sever listening on port ${app.get("port")}`);
});

server.on("error", (err) => {
  if (err.errno === "EACESS") {
    console.error(`Port ${app.get("port")} already in use.\nExiting...`);
    process.exit(1);
  }
});

module.exports = app;
