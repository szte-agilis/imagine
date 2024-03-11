/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  logger.log("Hello from Firebase!");
  res.send("Hello from Firebase!");
});

router.post("/join", (req, res) => {
  logger.debug(req);
  res.send("Hello from Firebase!");
});

// handle errors
app.use((err, req, res, next) => {
  res.status(500).send(err);
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
app.use("/lobby", router);
exports.lobby = onRequest(app);
