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
const jwt = require("jsonwebtoken");

initializeApp();

const app = express();
const router = express.Router();

async function requireAuth(req, res, next) {
  const { token } = req.body;
  if (!token) {
    res.status(401).send("Missing token, unauthorized");
    return;
  }
  try {
    let userId;
    if (
      ["localhost", "127.0.0.1", "::1"].includes(req.hostname) &&
      process.env.NODE_ENV !== "production"
    ) {
      // Fix for local development
      logger.warn("Using local development token");
      const tokenData = jwt.decode(token, process.env.JWT_SECRET);
      userId = tokenData["user_id"];
    } else {
      const tokenData = await getAuth().verifyIdToken(token);
      userId = tokenData.uid;
    }

    if (!userId) {
      res.status(401).send("Unauthorized, Invalid token");
      return;
    }
    req.user = userId;
    next();
  } catch (err) {
    logger.error(err);
    logger.error(token);
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
