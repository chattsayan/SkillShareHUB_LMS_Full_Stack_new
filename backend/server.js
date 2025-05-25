import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/database.js";
import { clerkWebhooks } from "./controllers/webhook.js";

const app = express();

// Middlewares
app.use(cors());

// Routes
app.get("/", (req, res) => res.send("API working"));
app.post("/clerk", express.json(), clerkWebhooks);

// PORT
const PORT = process.env.PORT || 5000;

// ----- CONNECT TO DATABASE -----
connectDB()
  .then(() => {
    console.log("DB Connection Established...");

    // ----- LISTENING TO SERVER -----
    app.listen(process.env.PORT, () => {
      console.log(`Server is successfully listening to port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed: ", err);
  });
