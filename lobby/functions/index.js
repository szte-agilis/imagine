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
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

const app = express();
const router = express.Router();

async function requireAuth(req, res, next) {
  const { token } = req.body;
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const tokenData = await getAuth().verifyIdToken(token);
    req.user = tokenData.uid;
    next();
  } catch (err) {
    logger.error(err);
    res.status(401).send("Unauthorized");
  }
}

router.get("/", (req, res) => {
  logger.log("Hello from Firebase!");
  res.send("Hello from Firebase!");
});

router.post("/join", requireAuth, async (req, res) => {
  const userId = req.user; // from requireAuth
  const { username } = req.body;

  res.json({ username, userId });
});

// handle errors
app.use((err, req, res, next) => {
  res.status(500).send(err);
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
app.use("/lobby", router);
exports.lobby = onRequest(app);
