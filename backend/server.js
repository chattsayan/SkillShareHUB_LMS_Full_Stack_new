import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/database.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhook.js";
import { clerkMiddleware } from "@clerk/express";

// Routers
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";

const app = express();

// Middlewares
app.use(cors());

// Special handling for Stripe webhooks
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).json({ error: "No stripe-signature header" });
      }
      next();
    } catch (error) {
      console.error("Error in webhook middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  stripeWebhooks
);

// Regular JSON parsing for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhooks/stripe") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => res.send("API working"));
app.post("/clerk", express.json(), clerkWebhooks);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

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

connectCloudinary();
