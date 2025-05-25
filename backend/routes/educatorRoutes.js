import express from "express";
import { updateRoleToEducator } from "../controllers/educatorController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const educatorRouter = express.Router();

// Add Educator Role - Protected route
educatorRouter.get("/update-role", ClerkExpressRequireAuth(), updateRoleToEducator);

export default educatorRouter;
