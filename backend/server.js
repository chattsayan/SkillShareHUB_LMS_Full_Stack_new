import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/database.js";
import { clerkWebhooks } from "./controllers/webhook.js";

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
    // methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type', 'svix-id', 'svix-timestamp', 'svix-signature']
  })
);

// Routes
app.post("/clerk", express.json(), clerkWebhooks);
app.get("/", (req, res) => res.send("API working"));

// PORT
const PORT = process.env.PORT || 5000;

// ----- CONNECT TO DATABASE -----
connectDB()
  .then(() => {
    console.log("DB Connection Established...");

    // ----- LISTENING TO SERVER -----
    app.listen(process.env.PORT, () => {
      console.log(`Server is successfully listening to port ${PORT}...`);
      console.log(
        `Webhook endpoint available at: http://localhost:${PORT}/clerk`
      );
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed: ", err);
  });
